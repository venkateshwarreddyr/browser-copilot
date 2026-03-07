export function parseSSE(buffer) {
  const events = [];
  const blocks = buffer.split('\n\n');
  const remaining = blocks.pop() || '';

  for (const block of blocks) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try {
          events.push(JSON.parse(data));
        } catch { /* skip malformed */ }
      }
    }
  }

  return { events, remaining };
}
