export function handleReadNetwork(input, networkRequests) {
  const { urlPattern, clear, limit = 100 } = input;

  let filtered = [...networkRequests];
  if (urlPattern) {
    filtered = filtered.filter(r => r.url.includes(urlPattern));
  }
  filtered = filtered.slice(-limit);

  if (clear) {
    networkRequests.length = 0;
  }

  if (filtered.length === 0) return 'No network requests found.';
  return JSON.stringify(filtered, null, 2);
}
