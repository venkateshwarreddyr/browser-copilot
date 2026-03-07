<script>
  import { chatState, sendMessage, clearChat, approvePlan } from './lib/chat.svelte.js';
  import ChatMessage from './components/ChatMessage.svelte';
  import ChatInput from './components/ChatInput.svelte';
  import PlanApproval from './components/PlanApproval.svelte';
  import ToolProgress from './components/ToolProgress.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';

  let showSettings = $state(false);
  let messagesEl = $state(null);

  // Auto-scroll on new messages
  $effect(() => {
    if (chatState.messages.length && messagesEl) {
      setTimeout(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 50);
    }
  });
</script>

<div class="app">
  <div class="toolbar">
    <span class="title">Browser Copilot</span>
    <div class="toolbar-actions">
      <button class="icon-btn" onclick={clearChat} title="Clear chat">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="icon-btn" onclick={() => showSettings = !showSettings} title="Settings">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>

  {#if showSettings}
    <SettingsPanel onClose={() => showSettings = false} />
  {/if}

  <div class="messages" bind:this={messagesEl}>
    {#if chatState.messages.length === 0}
      <div class="empty">Send a message to get started.</div>
    {/if}

    {#each chatState.messages as message (message.id)}
      {#if message.role === 'plan'}
        <PlanApproval plan={message.content} onApprove={approvePlan} />
      {:else}
        <ChatMessage {message} />
      {/if}
    {/each}

    <ToolProgress text={chatState.progress} />
  </div>

  <ChatInput onSend={sendMessage} disabled={chatState.isRunning} />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f9fafb;
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
  }
  .title {
    font-weight: 600;
    font-size: 15px;
    color: #1f2937;
  }
  .toolbar-actions {
    display: flex;
    gap: 4px;
  }
  .icon-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #6b7280;
    border-radius: 4px;
  }
  .icon-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
  }
  .empty {
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
    margin-top: 40px;
  }
</style>
