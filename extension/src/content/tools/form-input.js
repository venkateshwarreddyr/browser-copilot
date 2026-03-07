export function handleFormInput(input, { resolveRef }) {
  const { ref, value } = input;
  const el = resolveRef(ref);
  if (!el) return `Element not found for ref: ${ref}`;

  if (el.tagName === 'SELECT') {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return `Set select ${ref} to "${value}"`;
  }

  if (el.tagName === 'INPUT' && el.type === 'checkbox') {
    el.checked = Boolean(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return `Set checkbox ${ref} to ${value}`;
  }

  if (el.tagName === 'INPUT' && el.type === 'radio') {
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return `Selected radio ${ref}`;
  }

  // Text input / textarea - use native setter for React/Vue compat
  const nativeSetter =
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

  el.focus();
  if (nativeSetter) {
    nativeSetter.call(el, String(value));
  } else {
    el.value = String(value);
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return `Set ${ref} value to "${value}"`;
}
