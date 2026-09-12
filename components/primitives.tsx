import { ReactNode } from 'react';

/** Page masthead. Type does the hierarchy — there is no box around it. */
export function PageHead({
  eyebrow,
  title,
  lede,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-12 pt-14 pb-12">
      <div className="max-w-[46ch]">
        <div className="text-[11px] font-medium tracking-[0.2em] text-ink-3 uppercase">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-[34px] leading-[1.08] font-semibold tracking-[-0.022em]">
          {title}
        </h1>
        {lede && (
          <p className="mt-4 text-[14px] leading-[1.6] text-ink-2">{lede}</p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

/** A single figure. Label above, value below, nothing around it. */
export function Stat({
  label,
  value,
  sub,
  align = 'left',
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : undefined}>
      <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
        {label}
      </div>
      <div className="tnum mt-2 text-[22px] leading-none font-medium tracking-[-0.015em]">
        {value}
      </div>
      {sub && <div className="tnum mt-2 text-[12px] text-ink-3">{sub}</div>}
    </div>
  );
}

/** The only rule on the site, and it is one pixel of near-nothing. */
export function Rule({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-rule ${className}`} />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
      {children}
    </div>
  );
}
