<script>
  let { message } = $props();
</script>

{#if message.role === 'plan'}
  <!-- Plan messages are handled by PlanApproval -->
{:else}
  <div class="message {message.role}" class:streaming={message.isStreaming}>
    <div class="role-label">{message.role === 'user' ? 'You' : 'Assistant'}</div>
    <div class="content">{message.content}</div>
    {#if message.isStreaming}
      <span class="cursor">|</span>
    {/if}
  </div>
{/if}

<style>
  .message {
    padding: 10px 14px;
    margin: 6px 0;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .user {
    background: #e3f2fd;
    margin-left: 24px;
  }
  .assistant {
    background: #fff;
    border: 1px solid #e5e7eb;
    margin-right: 24px;
  }
  .role-label {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .cursor {
    animation: blink 1s step-end infinite;
    color: #3b82f6;
    font-weight: bold;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
