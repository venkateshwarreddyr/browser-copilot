<script>
  let { plan, onApprove } = $props();
</script>

{#if plan}
  <section class="plan-card">
    <header class="plan-header">
      <div class="title">Plan Approval Required</div>
      <div class="subtitle">Review scope and execution steps before running tools.</div>
    </header>

    <div class="section">
      <div class="section-title">Domains</div>
      <ul>
        {#each plan.domains as domain}
          <li>{domain}</li>
        {/each}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">Approach</div>
      <ol>
        {#each plan.approach as step}
          <li>{step}</li>
        {/each}
      </ol>
    </div>

    <footer class="actions">
      <button class="reject" onclick={() => onApprove(false, plan)}>Reject</button>
      <button class="approve" onclick={() => onApprove(true, plan)}>Approve and Run</button>
    </footer>
  </section>
{/if}

<style>
  .plan-card {
    margin: 8px 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(167, 139, 250, 0.2);
    border-radius: 16px;
  }

  .plan-header {
    margin-bottom: 14px;
  }

  .title {
    font-weight: 700;
    font-size: 14px;
    color: #e4e4e7;
  }

  .subtitle {
    font-size: 12px;
    color: #52525b;
    margin-top: 4px;
  }

  .section {
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    color: #a78bfa;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  ul,
  ol {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    color: #a1a1aa;
    line-height: 1.5;
  }

  li {
    margin-bottom: 4px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
  }

  .approve,
  .reject {
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .approve {
    background: #4ade80;
    color: #09090b;
    border-color: transparent;
  }

  .approve:hover {
    background: #22c55e;
  }

  .reject {
    background: transparent;
    border-color: rgba(244, 63, 94, 0.2);
    color: #fb7185;
  }

  .reject:hover {
    background: rgba(244, 63, 94, 0.08);
  }
</style>
