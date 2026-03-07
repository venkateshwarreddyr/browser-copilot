import { streamChat } from './api.js';
import { TOOL_DEFINITIONS } from './tools.js';
import { getSettings } from './storage.js';

let messages = $state([]);
let isRunning = $state(false);
let progress = $state(null);
let pendingPlan = $state(null);
let conversationHistory = $state([]);

let planResolve = null;

export const chatState = {
  get messages() { return messages; },
  get isRunning() { return isRunning; },
  get progress() { return progress; },
  get pendingPlan() { return pendingPlan; },
};

export function clearChat() {
  messages = [];
  conversationHistory = [];
  isRunning = false;
  progress = null;
  pendingPlan = null;
}

export function approvePlan(approved, plan) {
  if (planResolve) {
    const resultText = approved
      ? `User has approved your plan. You can now start executing the plan.\n\nPlan steps:\n${plan.approach.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nStart by using the TodoWrite tool to track your progress through these steps.`
      : 'User has rejected your plan. Please ask the user what they would like you to do instead.';
    planResolve(resultText);
    planResolve = null;
    pendingPlan = null;
  }
}

async function getTabContext() {
  try {
    return await chrome.runtime.sendMessage({ type: 'GET_TABS_CONTEXT' });
  } catch {
    return [];
  }
}

function buildSystemPrompt() {
  return [
    {
      type: 'text',
      text: `You are a web automation assistant with browser tools. Use the available tools to help the user interact with web pages. When you need to take actions on pages, first use read_page to understand the page structure, then use the appropriate tools.

Platform-specific: You are on a Mac system. Use "cmd" as the modifier key for keyboard shortcuts.`,
    },
  ];
}

export async function sendMessage(text) {
  if (isRunning) return;
  isRunning = true;

  const userMsgId = Date.now().toString();
  messages = [...messages, { id: userMsgId, role: 'user', content: text }];

  // Build user content blocks
  const tabs = await getTabContext();
  const activeTab = tabs.find(t => t.active) || tabs[0];
  const userContent = [
    { type: 'text', text },
    {
      type: 'text',
      text: `<system-reminder>${JSON.stringify({
        availableTabs: tabs.map(t => ({ tabId: t.tabId || t.id, title: t.title, url: t.url })),
        initialTabId: activeTab?.tabId || activeTab?.id,
      })}</system-reminder>`,
    },
  ];

  // Add planning mode reminder on first message
  if (conversationHistory.length === 0) {
    userContent.push({
      type: 'text',
      text: '<system-reminder>You are in planning mode. Before executing any tools, you must first present a plan to the user using the update_plan tool. The plan should include: domains (list of domains you will visit) and approach (high-level steps you will take).</system-reminder>',
    });
  }

  conversationHistory = [...conversationHistory, { role: 'user', content: userContent }];

  try {
    await runAgentLoop();
  } catch (error) {
    messages = [...messages, { id: Date.now().toString(), role: 'assistant', content: `Error: ${error.message}` }];
  }

  isRunning = false;
  progress = null;
}

async function runAgentLoop() {
  const maxIterations = 50;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;
    const settings = await getSettings();
    const system = buildSystemPrompt();

    // Stream the response
    const assistantBlocks = [];
    let currentTextBlock = null;
    let currentToolBlock = null;
    let assistantMsgId = Date.now().toString();
    let streamingText = '';
    let msgAdded = false;

    await streamChat({
      messages: conversationHistory,
      tools: TOOL_DEFINITIONS,
      system,
      model: settings.model,
      onEvent: (event) => {
        switch (event.type) {
          case 'content_block_start': {
            if (event.content_block?.type === 'text') {
              currentTextBlock = { type: 'text', text: '' };
            } else if (event.content_block?.type === 'tool_use') {
              currentToolBlock = {
                type: 'tool_use',
                id: event.content_block.id,
                name: event.content_block.name,
                input: {},
                _inputJson: '',
              };
              // Show tool name as progress
              progress = `Running ${event.content_block.name}...`;
            }
            break;
          }
          case 'content_block_delta': {
            if (event.delta?.type === 'text_delta' && currentTextBlock) {
              currentTextBlock.text += event.delta.text;
              streamingText += event.delta.text;
              // Only add message to UI when we actually have text
              if (!msgAdded) {
                messages = [...messages, { id: assistantMsgId, role: 'assistant', content: streamingText, isStreaming: true }];
                msgAdded = true;
              } else {
                messages = messages.map(m =>
                  m.id === assistantMsgId ? { ...m, content: streamingText } : m
                );
              }
            } else if (event.delta?.type === 'input_json_delta' && currentToolBlock) {
              currentToolBlock._inputJson += event.delta.partial_json;
            }
            break;
          }
          case 'content_block_stop': {
            if (currentTextBlock) {
              assistantBlocks.push({ type: 'text', text: currentTextBlock.text });
              currentTextBlock = null;
            }
            if (currentToolBlock) {
              try {
                currentToolBlock.input = JSON.parse(currentToolBlock._inputJson);
              } catch { /* keep empty */ }
              const { _inputJson, ...toolBlock } = currentToolBlock;
              assistantBlocks.push(toolBlock);
              currentToolBlock = null;
            }
            break;
          }
        }
      },
    });

    // Finalize streaming message (only if we added one)
    if (msgAdded) {
      messages = messages.map(m =>
        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
      );
    }

    // Add assistant turn to history
    conversationHistory = [...conversationHistory, { role: 'assistant', content: assistantBlocks }];

    // Check for tool calls
    const toolCalls = assistantBlocks.filter(b => b.type === 'tool_use');
    if (toolCalls.length === 0) {
      // No tool calls, agent loop done
      return;
    }

    // Execute tools and collect results
    const toolResults = [];
    for (const toolCall of toolCalls) {
      progress = `Running ${toolCall.name}...`;

      let result;
      if (toolCall.name === 'turn_answer_start') {
        result = 'Proceed with your response.';
      } else if (toolCall.name === 'update_plan') {
        result = await handlePlanApproval(toolCall.input);
      } else {
        try {
          result = await chrome.runtime.sendMessage({
            type: 'EXECUTE_TOOL',
            toolName: toolCall.name,
            toolInput: toolCall.input,
          });
          if (typeof result === 'object' && result?.error) {
            result = `Error: ${result.error}`;
          } else if (typeof result === 'object') {
            result = JSON.stringify(result);
          }
        } catch (err) {
          result = `Error executing ${toolCall.name}: ${err.message}`;
        }
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolCall.id,
        content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }],
      });
    }

    // Add tool results to history
    conversationHistory = [...conversationHistory, { role: 'user', content: toolResults }];
    progress = null;
  }
}

function handlePlanApproval(planInput) {
  return new Promise((resolve) => {
    pendingPlan = planInput;
    planResolve = resolve;
    // Show plan in messages
    messages = [...messages, {
      id: Date.now().toString(),
      role: 'plan',
      content: planInput,
    }];
  });
}
