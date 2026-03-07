<script>
  import { getSettings, saveSettings } from '../lib/storage.js';

  let { onClose } = $props();
  let backendUrl = $state('');
  let model = $state('');
  let saved = $state(false);

  $effect(() => {
    getSettings().then(s => {
      backendUrl = s.backendUrl;
      model = s.model;
    });
  });

  async function save() {
    await saveSettings({ backendUrl, model });
    saved = true;
    setTimeout(() => { saved = false; }, 2000);
  }
</script>

<div class="settings">
  <div class="header">
    <span>Settings</span>
    <button class="close" onclick={onClose}>&times;</button>
  </div>

  <label>
    Backend URL
    <input type="text" bind:value={backendUrl} placeholder="http://localhost:3001" />
  </label>

  <label>
    Model
    <input type="text" bind:value={model} placeholder="claude-sonnet-4-6" />
  </label>

  <button class="save-btn" onclick={save}>
    {saved ? 'Saved!' : 'Save'}
  </button>
</div>

<style>
  .settings {
    padding: 14px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    margin: 8px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6b7280;
  }
  label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 10px;
  }
  input {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
  }
  input:focus {
    border-color: #3b82f6;
  }
  .save-btn {
    width: 100%;
    padding: 8px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  .save-btn:hover { background: #2563eb; }
</style>
