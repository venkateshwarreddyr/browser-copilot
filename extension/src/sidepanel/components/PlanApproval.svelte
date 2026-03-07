<script>
  let { plan, onApprove } = $props();
</script>

{#if plan}
  <div class="plan-card">
    <div class="plan-header">Plan Approval</div>

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

    <div class="actions">
      <button class="approve" onclick={() => onApprove(true, plan)}>Approve</button>
      <button class="reject" onclick={() => onApprove(false, plan)}>Reject</button>
    </div>
  </div>
{/if}

<style>
  .plan-card {
    margin: 8px 0;
    padding: 14px;
    background: #fffbeb;
    border: 1px solid #fbbf24;
    border-radius: 10px;
  }
  .plan-header {
    font-weight: 600;
    font-size: 14px;
    color: #92400e;
    margin-bottom: 10px;
  }
  .section { margin-bottom: 8px; }
  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: #78716c;
    margin-bottom: 4px;
  }
  ul, ol {
    padding-left: 20px;
    font-size: 13px;
    color: #44403c;
  }
  li { margin-bottom: 2px; }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .approve {
    padding: 6px 16px;
    background: #16a34a;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  .approve:hover { background: #15803d; }
  .reject {
    padding: 6px 16px;
    background: #dc2626;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  .reject:hover { background: #b91c1c; }
</style>
