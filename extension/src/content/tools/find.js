export function handleFind(input, { assignRef }) {
  const { query } = input;
  const queryLower = query.toLowerCase();
  const results = [];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let node;
  while ((node = walker.nextNode()) && results.length < 20) {
    const el = node;
    const text = (el.innerText || '').trim().toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const alt = (el.getAttribute('alt') || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();

    const match =
      text.includes(queryLower) ||
      ariaLabel.includes(queryLower) ||
      placeholder.includes(queryLower) ||
      title.includes(queryLower) ||
      alt.includes(queryLower) ||
      role.includes(queryLower);

    if (match) {
      const refId = assignRef(el);
      results.push({
        ref: refId,
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || '').trim().slice(0, 100),
        role: el.getAttribute('role') || '',
      });
    }
  }

  if (results.length === 0) return `No elements found matching "${query}"`;
  let output = JSON.stringify(results, null, 2);
  if (results.length >= 20) output += '\n(More than 20 matches. Use a more specific query.)';
  return output;
}
