<script>
  let { onSend, disabled = false } = $props();
  let text = $state('');

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    text = '';
  }
</script>

<div class="input-container">
  <textarea
    bind:value={text}
    onkeydown={handleKeydown}
    placeholder="Type a message..."
    rows="2"
    {disabled}
  ></textarea>
  <button onclick={submit} disabled={disabled || !text.trim()}>
    Send
  </button>
</div>

<style>
  .input-container {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
  }
  textarea {
    flex: 1;
    resize: none;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
  }
  textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  }
  textarea:disabled {
    background: #f3f4f6;
  }
  button {
    padding: 8px 16px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    align-self: flex-end;
  }
  button:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
  button:hover:not(:disabled) {
    background: #2563eb;
  }
</style>
