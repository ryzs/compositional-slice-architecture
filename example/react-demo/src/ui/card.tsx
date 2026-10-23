import type { ReactNode } from 'react';

type CardProps = {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children?: ReactNode;
};

// UI organism. Props speak UI language (title, subtitle, footer) — never
// domain language (product, invoice). That's the test for living in ui/.
export function Card({ title, subtitle, footer, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <h3>{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
