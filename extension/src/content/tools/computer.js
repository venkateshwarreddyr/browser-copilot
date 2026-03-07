export function handleComputer(input, { resolveRef }) {
  const { action, coordinate, text, duration, scroll_direction, scroll_amount,
    start_coordinate, ref, modifiers, repeat, region } = input;

  switch (action) {
    case 'left_click':
    case 'right_click':
    case 'double_click':
    case 'triple_click': {
      let targetEl, x, y;
      if (ref) {
        targetEl = resolveRef(ref);
        if (!targetEl) return `Ref ${ref} not found`;
        const rect = targetEl.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (coordinate) {
        [x, y] = coordinate;
        targetEl = document.elementFromPoint(x, y);
      }
      if (!targetEl) return 'No element at target location';

      const mods = parseModifiers(modifiers);
      const button = action === 'right_click' ? 2 : 0;
      const clickCount = { left_click: 1, double_click: 2, triple_click: 3, right_click: 1 }[action];

      for (let i = 0; i < clickCount; i++) {
        targetEl.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button, bubbles: true, ...mods }));
        targetEl.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button, bubbles: true, ...mods }));
        targetEl.dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, button, bubbles: true, ...mods }));
      }
      if (action === 'double_click') {
        targetEl.dispatchEvent(new MouseEvent('dblclick', { clientX: x, clientY: y, bubbles: true, ...mods }));
      }
      // For links / buttons, also trigger native behavior
      if (targetEl.tagName === 'A' || targetEl.closest('a')) {
        const link = targetEl.tagName === 'A' ? targetEl : targetEl.closest('a');
        if (link.href && !link.href.startsWith('javascript:')) {
          link.click();
        }
      } else {
        targetEl.click();
      }
      return `Clicked at (${Math.round(x)}, ${Math.round(y)})`;
    }

    case 'type': {
      const activeEl = document.activeElement;
      if (!activeEl) return 'No focused element';
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        nativeSetter.call(activeEl, (activeEl.value || '') + text);
      } else {
        document.execCommand('insertText', false, text);
      }
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      return `Typed "${text}"`;
    }

    case 'key': {
      const keys = text.split(' ');
      const times = repeat || 1;
      for (let i = 0; i < times; i++) {
        for (const key of keys) {
          if (key.includes('+')) {
            const parts = key.split('+');
            const mainKey = parts.pop();
            const kbMods = {
              ctrlKey: parts.includes('ctrl'),
              shiftKey: parts.includes('shift'),
              altKey: parts.includes('alt'),
              metaKey: parts.includes('cmd') || parts.includes('meta'),
            };
            document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: mainKey, bubbles: true, ...kbMods }));
            document.activeElement?.dispatchEvent(new KeyboardEvent('keyup', { key: mainKey, bubbles: true, ...kbMods }));
          } else {
            document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            document.activeElement?.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
          }
        }
      }
      return `Pressed key(s): ${text}`;
    }

    case 'scroll': {
      const amount = (scroll_amount || 3) * 100;
      const dx = scroll_direction === 'left' ? -amount : scroll_direction === 'right' ? amount : 0;
      const dy = scroll_direction === 'down' ? amount : scroll_direction === 'up' ? -amount : 0;
      if (coordinate) {
        const el = document.elementFromPoint(coordinate[0], coordinate[1]);
        (el || window).scrollBy({ left: dx, top: dy, behavior: 'smooth' });
      } else {
        window.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
      }
      return `Scrolled ${scroll_direction} by ${amount}px`;
    }

    case 'scroll_to': {
      const el = resolveRef(ref);
      if (!el) return `Ref ${ref} not found`;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return `Scrolled to ${ref}`;
    }

    case 'hover': {
      let x, y;
      if (ref) {
        const el = resolveRef(ref);
        if (!el) return `Ref ${ref} not found`;
        const rect = el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (coordinate) {
        [x, y] = coordinate;
      } else {
        return 'No target for hover';
      }
      const el = document.elementFromPoint(x, y);
      if (el) {
        el.dispatchEvent(new MouseEvent('mouseover', { clientX: x, clientY: y, bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseenter', { clientX: x, clientY: y }));
      }
      return `Hovered at (${Math.round(x)}, ${Math.round(y)})`;
    }

    case 'left_click_drag': {
      if (!start_coordinate || !coordinate) return 'Drag requires start_coordinate and coordinate';
      const [sx, sy] = start_coordinate;
      const [ex, ey] = coordinate;
      const startEl = document.elementFromPoint(sx, sy);
      if (startEl) {
        startEl.dispatchEvent(new MouseEvent('mousedown', { clientX: sx, clientY: sy, bubbles: true }));
        startEl.dispatchEvent(new MouseEvent('mousemove', { clientX: ex, clientY: ey, bubbles: true }));
        startEl.dispatchEvent(new MouseEvent('mouseup', { clientX: ex, clientY: ey, bubbles: true }));
      }
      return `Dragged from (${sx},${sy}) to (${ex},${ey})`;
    }

    case 'wait':
      return new Promise(resolve => setTimeout(() => resolve(`Waited ${duration || 1}s`), (duration || 1) * 1000));

    case 'screenshot':
      return { _type: 'screenshot_request' };

    case 'zoom':
      return { _type: 'zoom_request', region };

    default:
      return `Unknown action: ${action}`;
  }
}

function parseModifiers(modStr) {
  if (!modStr) return {};
  const mods = modStr.toLowerCase().split('+');
  return {
    ctrlKey: mods.includes('ctrl'),
    shiftKey: mods.includes('shift'),
    altKey: mods.includes('alt'),
    metaKey: mods.includes('cmd') || mods.includes('meta'),
  };
}
