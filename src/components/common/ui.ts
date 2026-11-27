export const buttonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-none text-sm font-semibold transition-[color,background-color,box-shadow,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonPrimary = `${buttonBase} neo-action border-2 border-ink bg-accent px-3.5 py-2 text-accent-ink hover:bg-surface hover:text-ink`;

export const buttonSecondary = `${buttonBase} border-2 border-border bg-surface px-3.5 py-2 text-ink hover:bg-highlight`;

export const buttonGhost = `${buttonBase} px-2.5 py-2 text-muted hover:bg-highlight hover:text-ink`;

export const buttonDanger = `${buttonBase} px-2.5 py-2 text-danger hover:bg-danger/10`;

export const iconButton =
  'inline-flex h-11 w-11 items-center justify-center border-2 border-transparent text-muted transition-colors duration-150 hover:border-border hover:bg-highlight hover:text-ink';

export const field =
  'w-full rounded-none border-2 border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/80 focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent';

export const select = `${field} pr-8`;

export const fieldLabel =
  'mb-1 block text-[11px] font-semibold uppercase text-muted';

export const kicker =
  'font-mono text-[10px] font-medium uppercase text-muted';

export const meta = 'font-mono text-[11px] text-muted';

export const sheet = 'border-2 border-border bg-surface';
