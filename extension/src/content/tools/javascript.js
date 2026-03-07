export function handleJavascript(input) {
  const { text: code } = input;
  try {
    const result = eval(code);
    return result === undefined ? 'undefined' : String(result);
  } catch (err) {
    return `Error: ${err.message}`;
  }
}
