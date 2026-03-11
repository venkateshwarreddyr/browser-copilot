<script>
  let { onSend, disabled = false, isRunning = false, onStop, quickPrompts = [] } = $props();
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

  function pickPrompt(prompt) {
    if (disabled) return;
    onSend(prompt);
  }
</script>

<div class="composer-area">
  <div class="composer" class:disabled={disabled}>
    <textarea
      bind:value={text}
      onkeydown={handleKeydown}
      placeholder="Reply to Browser"
      rows="1"
      {disabled}
    ></textarea>
    <div class="composer-bar">
      <div class="composer-bar-left">
        <!-- Ask before acting indicator -->
        <span class="safety-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Ask before acting
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      <div class="composer-bar-right">
        <!-- Teach icon -->
        <button class="bar-icon" disabled={disabled} title="Teach mode">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3l1 14 4-4 6 6 2-2-6-6 4-4z"/></svg>
        </button>
        <!-- Attach -->
        <button class="bar-icon" disabled={disabled} title="Attach">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <!-- Send or Stop -->
        {#if isRunning}
          <button class="send-btn stop" onclick={onStop} title="Stop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
        {:else}
          <button class="send-btn" onclick={submit} disabled={disabled || !text.trim()} aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94l18.04-8.01a.75.75 0 000-1.37L3.478 2.405z"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <p class="disclaimer">Browser is AI and can make mistakes. Please double-check responses.</p>
</div>

<style>
  .quick-prompts {
    display: flex;
    gap: 6px;
    padding: 6px 12px 0;
    overflow-x: auto;
    background: transparent;
    scroll-snap-type: x mandatory;
  }

  .quick-prompts::-webkit-scrollbar {
    height: 3px;
  }

  .quick-prompts::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
  }

  .prompt-chip {
    scroll-snap-align: start;
    min-width: 200px;
    text-align: left;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.03);
    color: #71717a;
    border-radius: 12px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .prompt-chip:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    color: #a1a1aa;
  }

  .prompt-chip:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ─── Composer area ─── */
  .composer-area {
    padding: 8px 14px 10px;
    background: transparent;
    flex-shrink: 0;
  }

  .composer {
    background: #18181b;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 20px;
    padding: 12px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: border-color 200ms ease;
  }

  .composer:focus-within {
    border-color: rgba(255, 255, 255, 0.14);
  }

  textarea {
    width: 100%;
    resize: none;
    min-height: 22px;
    max-height: 120px;
    border: none;
    outline: none;
    font-size: 14px;
    line-height: 1.5;
    font-family: inherit;
    color: #e4e4e7;
    background: transparent;
    padding: 0;
  }

  textarea::placeholder {
    color: #52525b;
  }

  textarea:disabled {
    color: #3f3f46;
    cursor: not-allowed;
  }

  .composer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0 2px;
  }

  .composer-bar-left {
    display: flex;
    align-items: center;
  }

  .safety-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #52525b;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;
    transition: all 120ms ease;
  }

  .safety-badge:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #71717a;
  }

  .composer-bar-right {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .bar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #3f3f46;
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .bar-icon:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: #71717a;
  }

  .bar-icon:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: #e4e4e7;
    color: #09090b;
    border-radius: 50%;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .send-btn:hover:not(:disabled) {
    background: #ffffff;
  }

  .send-btn:disabled {
    background: #27272a;
    color: #3f3f46;
    cursor: not-allowed;
  }

  .send-btn.stop {
    background: #e4e4e7;
    color: #09090b;
  }

  .send-btn.stop:hover {
    background: #ffffff;
  }

  .composer.disabled {
    opacity: 0.5;
    border-color: rgba(255, 255, 255, 0.04);
  }

  .disclaimer {
    text-align: center;
    font-size: 11px;
    color: #3f3f46;
    margin: 8px 0 2px;
    line-height: 1.3;
  }
</style>
