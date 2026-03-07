// Open side panel on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Message routing
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const handler = messageHandlers[msg.type];
  if (!handler) return false;

  handler(msg, sender)
    .then(sendResponse)
    .catch(err => sendResponse({ error: err.message }));

  return true; // async
});

const messageHandlers = {
  EXECUTE_TOOL: (msg) => executeTool(msg.toolName, msg.toolInput),
  GET_TABS_CONTEXT: () => getTabsContext(),
  CAPTURE_SCREENSHOT: (msg) => captureScreenshot(msg.tabId),
  CREATE_TAB: () => handleTabsCreate(),
};

async function executeTool(toolName, input) {
  switch (toolName) {
    // Content script tools - forward to tab
    case 'read_page':
    case 'find':
    case 'form_input':
    case 'get_page_text':
    case 'javascript_tool':
    case 'read_console_messages':
    case 'read_network_requests': {
      const tabId = input.tabId;
      if (!tabId) return 'Error: tabId is required';
      return await chrome.tabs.sendMessage(tabId, { type: 'TOOL_EXEC', tool: toolName, input });
    }

    case 'computer': {
      const tabId = input.tabId;
      if (!tabId) return 'Error: tabId is required';

      if (input.action === 'screenshot') {
        return await captureScreenshot(tabId);
      }
      if (input.action === 'zoom') {
        // Capture full screenshot, extension-side cropping would be done by the AI
        return await captureScreenshot(tabId);
      }

      // Forward other computer actions to content script
      const result = await chrome.tabs.sendMessage(tabId, { type: 'TOOL_EXEC', tool: 'computer', input });

      // Handle screenshot requests from content script
      if (result && typeof result === 'object' && result._type === 'screenshot_request') {
        return await captureScreenshot(tabId);
      }
      if (result && typeof result === 'object' && result._type === 'zoom_request') {
        return await captureScreenshot(tabId);
      }

      return result;
    }

    // Chrome API tools - handle directly
    case 'navigate':
      return await handleNavigate(input);

    case 'tabs_context':
      return await getTabsContext();

    case 'tabs_create':
      return await handleTabsCreate();

    case 'resize_window':
      return await handleResizeWindow(input);

    case 'update_plan':
      return 'Plan presented to user.';

    case 'turn_answer_start':
      return 'Proceed with your response.';

    default:
      return `Unknown tool: ${toolName}`;
  }
}

async function handleNavigate(input) {
  const { tabId, url } = input;
  if (!tabId) return 'Error: tabId is required';

  if (url === 'back') {
    await chrome.tabs.goBack(tabId);
  } else if (url === 'forward') {
    await chrome.tabs.goForward(tabId);
  } else {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    await chrome.tabs.update(tabId, { url: fullUrl });
  }

  // Wait for page load
  await waitForTabLoad(tabId);
  const tab = await chrome.tabs.get(tabId);
  return `Navigated to ${tab.url}`;
}

function waitForTabLoad(tabId, timeout = 15000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeout);

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        // Small delay for JS frameworks to render
        setTimeout(resolve, 500);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function captureScreenshot(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 80 });
    return dataUrl;
  } catch (err) {
    return `Screenshot failed: ${err.message}`;
  }
}

async function getTabsContext() {
  const tabs = await chrome.tabs.query({});
  return tabs
    .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
    .map(t => ({
      tabId: t.id,
      title: t.title || '',
      url: t.url,
      active: t.active,
    }));
}

async function handleTabsCreate() {
  const tab = await chrome.tabs.create({ active: false });
  return { tabId: tab.id, title: tab.title || 'New Tab', url: tab.url };
}

async function handleResizeWindow(input) {
  const { tabId, width, height } = input;
  const tab = await chrome.tabs.get(tabId);
  await chrome.windows.update(tab.windowId, { width, height });
  return `Window resized to ${width}x${height}`;
}
