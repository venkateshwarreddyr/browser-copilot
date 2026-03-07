<script>
  let { text } = $props();
</script>

{#if text}
  <div class="progress">
    <div class="spinner"></div>
    <span>{text}</span>
  </div>
{/if}

<style>
  .progress {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    margin: 4px 0;
    font-size: 13px;
    color: #6b7280;
  }
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #d1d5db;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
