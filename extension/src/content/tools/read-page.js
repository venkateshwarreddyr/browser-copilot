export function handleReadPage(input, { assignRef, clearRefs }) {
  const { filter = 'all', depth = 15, ref_id, max_chars = 50000 } = input;

  clearRefs();

  const rootElement = ref_id
    ? document.querySelector(`[data-copilot-ref="${ref_id}"]`)
    : document.body;

  if (!rootElement) return `Element not found for ref_id: ${ref_id}`;

  const tree = buildTree(rootElement, { filter, maxDepth: depth, currentDepth: 0, assignRef });
  const output = serializeNode(tree, 0);

  if (output.length > max_chars) {
    return `Output exceeds ${max_chars} chars (got ${output.length}). Use smaller depth or specify ref_id to focus on a section.`;
  }

  return output;
}

function buildTree(element, opts) {
  if (opts.currentDepth > opts.maxDepth) return null;
  if (!element || element.nodeType !== 1) return null;

  const style = window.getComputedStyle(element);
  const hidden = style.display === 'none' || style.visibility === 'hidden';
  const role = getAriaRole(element);
  const interactive = isInteractive(element);

  if (opts.filter === 'interactive' && !interactive && element !== document.body) {
    const children = [];
    for (const child of element.children) {
      const sub = buildTree(child, { ...opts, currentDepth: opts.currentDepth + 1 });
      if (sub) {
        if (Array.isArray(sub)) children.push(...sub);
        else children.push(sub);
      }
    }
    return children.length > 0 ? children : null;
  }

  if (hidden && element !== document.body) return null;

  const refId = opts.assignRef(element);
  const node = {
    ref: refId,
    tag: element.tagName.toLowerCase(),
    role,
  };

  const name = getAccessibleName(element);
  if (name) node.name = name;

  if (interactive) node.interactive = true;
  if (element.tagName === 'INPUT') { node.type = element.type; if (element.value) node.value = element.value; }
  if (element.tagName === 'TEXTAREA' && element.value) node.value = element.value;
  if (element.tagName === 'SELECT' && element.value) node.value = element.value;
  if (element.tagName === 'A' && element.href) node.href = element.href;
  if (element.tagName === 'IMG' && element.alt) node.alt = element.alt;

  const directText = getDirectText(element).trim();
  const children = [];
  for (const child of element.children) {
    const sub = buildTree(child, { ...opts, currentDepth: opts.currentDepth + 1 });
    if (sub) {
      if (Array.isArray(sub)) children.push(...sub);
      else children.push(sub);
    }
  }

  if (children.length > 0) {
    node.children = children;
  } else if (directText) {
    node.text = directText.slice(0, 200);
  }

  return node;
}

function getAriaRole(el) {
  if (el.getAttribute('role')) return el.getAttribute('role');
  const map = {
    A: 'link', BUTTON: 'button', INPUT: 'textbox', SELECT: 'combobox',
    TEXTAREA: 'textbox', NAV: 'navigation', MAIN: 'main', HEADER: 'banner',
    FOOTER: 'contentinfo', ASIDE: 'complementary', FORM: 'form',
    H1: 'heading', H2: 'heading', H3: 'heading', H4: 'heading', H5: 'heading', H6: 'heading',
    UL: 'list', OL: 'list', LI: 'listitem', TABLE: 'table', IMG: 'img',
  };
  return map[el.tagName] || 'generic';
}

function isInteractive(el) {
  const tags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (tags.includes(el.tagName)) return true;
  const role = el.getAttribute('role');
  if (role === 'button' || role === 'link' || role === 'tab' || role === 'menuitem') return true;
  if (el.tabIndex >= 0) return true;
  return false;
}

function getAccessibleName(el) {
  return el.getAttribute('aria-label')
    || el.getAttribute('title')
    || el.getAttribute('alt')
    || el.getAttribute('placeholder')
    || '';
}

function getDirectText(el) {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) text += node.textContent;
  }
  return text;
}

function serializeNode(node, indent) {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(n => serializeNode(n, indent)).join('');

  const pad = '  '.repeat(indent);
  let line = `${pad}[${node.ref}] ${node.tag}`;
  if (node.role !== 'generic') line += ` (${node.role})`;
  if (node.name) line += ` '${node.name}'`;
  if (node.text) line += ` "${node.text}"`;
  if (node.type) line += ` type=${node.type}`;
  if (node.value) line += ` value="${node.value}"`;
  if (node.href) line += ` href=${node.href}`;
  if (node.alt) line += ` alt="${node.alt}"`;
  if (node.interactive) line += ' [interactive]';
  line += '\n';

  if (node.children) {
    for (const child of node.children) {
      line += serializeNode(child, indent + 1);
    }
  }

  return line;
}
