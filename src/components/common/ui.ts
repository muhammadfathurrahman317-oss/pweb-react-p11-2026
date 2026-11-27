/**
 * Shared class recipes. Keeping them in one place is what makes the ledger
 * consistent: every sheet, field, and button uses the same rules and radii.
 */
export const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonPrimary = `${buttonBase} bg-accent px-3.5 py-2 text-accent-ink hover:bg-ink`;

export const buttonSecondary = `${buttonBase} border border-border bg-surface px-3.5 py-2 text-ink hover:bg-highlight`;

export const buttonGhost = `${buttonBase} px-2.5 py-2 text-muted hover:bg-highlight hover:text-ink`;

export const buttonDanger = `${buttonBase} px-2.5 py-2 text-danger hover:bg-danger/10`;

export const iconButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-[2px] text-muted transition-colors duration-150 hover:bg-highlight hover:text-ink';

export const field =
  'w-full rounded-[2px] border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/80 focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent';

export const select = `${field} pr-8`;

export const fieldLabel =
  'mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-muted';

export const kicker =
  'font-mono text-[10px] uppercase tracking-[0.14em] text-muted';

export const meta = 'font-mono text-[11px] text-muted';

export const sheet = 'rounded-[3px] border border-rule bg-surface';
