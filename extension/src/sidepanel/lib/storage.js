const DEFAULTS = {
  backendUrl: 'http://localhost:3001',
  model: '',
};

export async function getSettings() {
  try {
    const result = await chrome.storage.local.get(DEFAULTS);
    return result;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings) {
  await chrome.storage.local.set(settings);
}
