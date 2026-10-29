<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { groupByProblem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // issues: problem → link to the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Record<string, string> } = $props();

  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .filter(([, n]) => n > 0)
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>came in by</th><th>tenants</th><th>seen</th><th>GitHub issue</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="muted">{channels(g.channels)}</td>
        <td class="muted">{g.tenants.join(', ')}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem].replace(/.*\/issues\//, '#')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
</style>
