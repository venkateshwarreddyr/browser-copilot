export const TOOL_DEFINITIONS = [
  {
    name: 'read_page',
    description: 'Get an accessibility tree representation of elements on the page. By default returns all elements including non-visible ones. Output is limited to 50000 characters.',
    input_schema: {
      type: 'object',
      properties: {
        filter: { type: 'string', enum: ['interactive', 'all'], description: 'Filter elements: "interactive" for buttons/links/inputs only, "all" for all elements (default: all)' },
        tabId: { type: 'number', description: 'Tab ID to read from.' },
        depth: { type: 'number', description: 'Maximum depth of the tree to traverse (default: 15).' },
        ref_id: { type: 'string', description: 'Reference ID of a parent element to focus on.' },
        max_chars: { type: 'number', description: 'Maximum characters for output (default: 50000).' },
      },
      required: ['tabId'],
    },
  },
  {
    name: 'find',
    description: 'Find elements on the page using natural language. Returns up to 20 matching elements with references.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language description of what to find.' },
        tabId: { type: 'number', description: 'Tab ID to search in.' },
      },
      required: ['query', 'tabId'],
    },
  },
  {
    name: 'form_input',
    description: 'Set values in form elements using element reference ID from the read_page tool.',
    input_schema: {
      type: 'object',
      properties: {
        ref: { type: 'string', description: 'Element reference ID (e.g., "ref_1").' },
        value: { type: ['string', 'boolean', 'number'], description: 'The value to set.' },
        tabId: { type: 'number', description: 'Tab ID.' },
      },
      required: ['ref', 'value', 'tabId'],
    },
  },
  {
    name: 'computer',
    description: 'Use a mouse and keyboard to interact with a web browser, and take screenshots.',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['left_click', 'right_click', 'type', 'screenshot', 'wait', 'scroll', 'key', 'left_click_drag', 'double_click', 'triple_click', 'zoom', 'scroll_to', 'hover'],
          description: 'The action to perform.',
        },
        coordinate: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: '(x, y) coordinates.' },
        text: { type: 'string', description: 'Text to type or key(s) to press.' },
        duration: { type: 'number', minimum: 0, maximum: 30, description: 'Seconds to wait.' },
        scroll_direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], description: 'Scroll direction.' },
        scroll_amount: { type: 'number', minimum: 1, maximum: 10, description: 'Scroll wheel ticks.' },
        start_coordinate: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2, description: 'Start coordinates for drag.' },
        region: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4, description: 'Region for zoom (x0,y0,x1,y1).' },
        repeat: { type: 'number', minimum: 1, maximum: 100, description: 'Repeat count for key action.' },
        ref: { type: 'string', description: 'Element reference ID.' },
        modifiers: { type: 'string', description: 'Modifier keys (e.g., "ctrl+shift").' },
        tabId: { type: 'number', description: 'Tab ID.' },
      },
      required: ['action', 'tabId'],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate to a URL, or go forward/back in browser history.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to. Use "forward" or "back" for history navigation.' },
        tabId: { type: 'number', description: 'Tab ID to navigate.' },
      },
      required: ['url', 'tabId'],
    },
  },
  {
    name: 'get_page_text',
    description: 'Extract raw text content from the page, prioritizing article content.',
    input_schema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Tab ID to extract text from.' },
        max_chars: { type: 'number', description: 'Maximum characters for output (default: 50000).' },
      },
      required: ['tabId'],
    },
  },
  {
    name: 'update_plan',
    description: 'Update the plan and present it to the user for approval before proceeding.',
    input_schema: {
      type: 'object',
      properties: {
        domains: { type: 'array', items: { type: 'string' }, description: 'List of domains you will visit.' },
        approach: { type: 'array', items: { type: 'string' }, description: 'Ordered list of steps you will follow.' },
      },
      required: ['domains', 'approach'],
    },
  },
  {
    name: 'tabs_create',
    description: 'Creates a new empty tab.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'tabs_context',
    description: 'Get context information about all available tabs.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'read_console_messages',
    description: 'Read browser console messages from a specific tab.',
    input_schema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Tab ID to read from.' },
        onlyErrors: { type: 'boolean', description: 'Only return error messages.' },
        clear: { type: 'boolean', description: 'Clear messages after reading.' },
        pattern: { type: 'string', description: 'Regex pattern to filter messages.' },
        limit: { type: 'number', description: 'Max messages to return (default: 100).' },
      },
      required: ['tabId'],
    },
  },
  {
    name: 'read_network_requests',
    description: 'Read HTTP network requests from a specific tab.',
    input_schema: {
      type: 'object',
      properties: {
        tabId: { type: 'number', description: 'Tab ID to read from.' },
        urlPattern: { type: 'string', description: 'URL pattern to filter requests.' },
        clear: { type: 'boolean', description: 'Clear requests after reading.' },
        limit: { type: 'number', description: 'Max requests to return (default: 100).' },
      },
      required: ['tabId'],
    },
  },
  {
    name: 'resize_window',
    description: 'Resize the current browser window to specified dimensions.',
    input_schema: {
      type: 'object',
      properties: {
        width: { type: 'number', description: 'Target width in pixels.' },
        height: { type: 'number', description: 'Target height in pixels.' },
        tabId: { type: 'number', description: 'Tab ID to get the window for.' },
      },
      required: ['width', 'height', 'tabId'],
    },
  },
  {
    name: 'javascript_tool',
    description: 'Execute JavaScript code in the context of the current page.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'Must be "javascript_exec".' },
        text: { type: 'string', description: 'JavaScript code to execute.' },
        tabId: { type: 'number', description: 'Tab ID to execute in.' },
      },
      required: ['action', 'text', 'tabId'],
    },
  },
  {
    name: 'turn_answer_start',
    description: 'Call this immediately before your text response to the user.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
];
