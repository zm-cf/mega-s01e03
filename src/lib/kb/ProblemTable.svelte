<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { problemRows } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // issues: problem → link to the ticket filed for it. status: problem → what engineering did.
  let {
    ticket,
    issues = {},
    status = {},
  }: { ticket: number; issues?: Record<string, string>; status?: Record<string, string> } = $props();

  const rows = $derived(problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .filter(([, n]) => n > 0)
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>came in by</th><th>tenants</th><th>seen</th><th>status</th><th>GitHub issue</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr class:open={!status[r.problem]}>
        <td><code>{r.problem}</code></td>
        <td>{r.reports.length}</td>
        <td class="muted">{channels(r.channels)}</td>
        <td class="muted">{r.tenants.length}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{status[r.problem] ?? 'open: nobody owns it'}</td>
        <td>{#if issues[r.problem]}<a href={issues[r.problem]}>{issues[r.problem].replace(/.*\/issues\//, '#')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows as r (r.problem)}
  {#each r.alsoUnder ?? [] as u (u.problem)}
    <p class="note">The {u.n} <code>{r.problem}</code> reports are also counted under <code>{u.problem}</code>, where the desk files them by tenant.</p>
  {/each}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:nth-last-child(2) { color: var(--warn); font-weight: 600; }
</style>
