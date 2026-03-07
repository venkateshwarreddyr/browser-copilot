export function handleReadConsole(input, consoleLogs) {
  const { onlyErrors, clear, pattern, limit = 100 } = input;

  let filtered = [...consoleLogs];
  if (onlyErrors) {
    filtered = filtered.filter(l => l.level === 'error');
  }
  if (pattern) {
    try {
      const regex = new RegExp(pattern, 'i');
      filtered = filtered.filter(l => regex.test(l.message));
    } catch {
      return `Invalid regex pattern: ${pattern}`;
    }
  }
  filtered = filtered.slice(-limit);

  if (clear) {
    consoleLogs.length = 0;
  }

  if (filtered.length === 0) return 'No console messages found.';
  return JSON.stringify(filtered, null, 2);
}
