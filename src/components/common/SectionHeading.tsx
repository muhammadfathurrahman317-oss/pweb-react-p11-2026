import React from 'react';

interface SectionHeadingProps {
  index: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * The margin index is part of the notebook structure: sections are numbered
 * because the page is read in order, not because numbers look technical.
 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  index,
  title,
  description,
  action,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-3">
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-1 font-mono text-[11px] leading-none text-muted">{index}</span>
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-tight text-ink sm:text-[28px]">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);
