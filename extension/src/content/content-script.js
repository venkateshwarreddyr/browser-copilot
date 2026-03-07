import { handleReadPage } from './tools/read-page.js';
import { handleFind } from './tools/find.js';
import { handleFormInput } from './tools/form-input.js';
import { handleComputer } from './tools/computer.js';
import { handleGetPageText } from './tools/get-page-text.js';
import { handleJavascript } from './tools/javascript.js';
import { handleReadConsole } from './tools/console.js';
import { handleReadNetwork } from './tools/network.js';

// Ref registry
const refMap = new Map();
let refCounter = 0;

function assignRef(element) {
  refCounter++;
  const refId = `ref_${refCounter}`;
  refMap.set(refId, new WeakRef(element));
  try { element.dataset.copilotRef = refId; } catch { /* SVG etc */ }
  return refId;
}

function resolveRef(refId) {
  const weakRef = refMap.get(refId);
  if (!weakRef) return null;
  const el = weakRef.deref();
  if (!el || !document.contains(el)) {
    refMap.delete(refId);
    return null;
  }
  return el;
}

function clearRefs() {
  refMap.clear();
  refCounter = 0;
}

// Console capture
const consoleLogs = [];
const origConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
};

function captureConsole(level, origFn) {
  return function (...args) {
    consoleLogs.push({
      level,
      message: args.map(a => {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
        catch { return String(a); }
      }).join(' '),
      timestamp: Date.now(),
    });
    // Keep buffer bounded
    if (consoleLogs.length > 1000) consoleLogs.splice(0, consoleLogs.length - 500);
    origFn(...args);
  };
}

console.log = captureConsole('log', origConsole.log);
console.error = captureConsole('error', origConsole.error);
console.warn = captureConsole('warn', origConsole.warn);
console.info = captureConsole('info', origConsole.info);

// Network capture
const networkRequests = [];
try {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        networkRequests.push({
          url: entry.name,
          type: entry.initiatorType,
          duration: Math.round(entry.duration),
          size: entry.transferSize || 0,
          timestamp: Date.now(),
        });
        if (networkRequests.length > 1000) networkRequests.splice(0, networkRequests.length - 500);
      }
    }
  });
  observer.observe({ type: 'resource', buffered: true });
} catch { /* PerformanceObserver not available */ }

// Message listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'TOOL_EXEC') return false;

  const handlers = {
    read_page: () => handleReadPage(msg.input, { assignRef, clearRefs }),
    find: () => handleFind(msg.input, { assignRef }),
    form_input: () => handleFormInput(msg.input, { resolveRef }),
    computer: () => handleComputer(msg.input, { resolveRef }),
    get_page_text: () => handleGetPageText(msg.input),
    javascript_tool: () => handleJavascript(msg.input),
    read_console_messages: () => handleReadConsole(msg.input, consoleLogs),
    read_network_requests: () => handleReadNetwork(msg.input, networkRequests),
  };

  const handler = handlers[msg.tool];
  if (!handler) {
    sendResponse({ error: `Unknown content tool: ${msg.tool}` });
    return false;
  }

  Promise.resolve(handler())
    .then(result => sendResponse(result))
    .catch(err => sendResponse({ error: err.message }));

  return true;
});
