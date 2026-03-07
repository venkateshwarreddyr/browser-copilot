export function handleGetPageText(input) {
  const { max_chars = 50000 } = input;

  const article = document.querySelector('article')
    || document.querySelector('[role="main"]')
    || document.querySelector('main');
  const source = article || document.body;

  let text = source.innerText || '';
  if (text.length > max_chars) {
    return text.slice(0, max_chars) + `\n...[truncated at ${max_chars} chars]`;
  }
  return text;
}
