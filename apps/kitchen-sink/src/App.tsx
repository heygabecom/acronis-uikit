import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  brands,
  defaultBrand,
  tokens,
  type Brand,
} from '@acronis-platform/design-theme/js';

import { ColorsSection } from '@/sections/colors';
import { ComponentsSection } from '@/sections/components';
import { ElementsSection } from '@/sections/elements';
import { IconsSection } from '@/sections/icons';

type ColorMode = 'light' | 'dark';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 56, scrollMarginTop: 72 }}>
      <h2
        style={{
          fontSize: 20,
          marginBottom: 20,
          paddingBottom: 8,
          borderBottom: '1px solid var(--av-colors-border-on-surface-divider)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const SECTIONS = [
  { id: 'colors', title: 'Colors & tokens', Component: ColorsSection },
  { id: 'elements', title: 'Default elements', Component: ElementsSection },
  { id: 'components', title: 'Components', Component: ComponentsSection },
  { id: 'icons', title: 'Icons', Component: IconsSection },
];

export default function App() {
  const [mode, setMode] = useState<ColorMode>('light');
  const [brand, setBrand] = useState<Brand>(defaultBrand);

  useEffect(() => {
    const html = document.documentElement;
    // Non-default brands are applied as a class (e.g. `brand-b`); the default
    // brand lives on `:root` so it carries no class.
    for (const b of brands) {
      if (b !== defaultBrand) html.classList.remove(b);
    }
    if (brand !== defaultBrand) html.classList.add(brand);
    html.classList.toggle('dark', mode === 'dark');
  }, [brand, mode]);

  // How many tokens the selected brand overrides vs the default, for the
  // current scheme — 0 means the brand renders identically to the default.
  const overrides = useMemo(() => {
    if (brand === defaultBrand) return 0;
    const base = tokens[defaultBrand][mode] as Record<string, string>;
    const current = tokens[brand][mode] as Record<string, string>;
    return Object.keys(current).filter((k) => base[k] !== current[k]).length;
  }, [brand, mode]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--av-colors-background-surface-primary)',
        color: 'var(--av-colors-text-on-surface-primary)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 24px',
          background: 'var(--av-colors-background-surface-primary)',
          borderBottom: '1px solid var(--av-colors-border-on-surface-divider)',
        }}
      >
        <strong>Acronis UI — Kitchen Sink</strong>
        <nav
          style={{ display: 'flex', gap: 16, marginLeft: 'auto', fontSize: 13 }}
        >
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{ color: 'var(--av-colors-text-on-surface-link)' }}
            >
              {s.title}
            </a>
          ))}
        </nav>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
          }}
        >
          Brand
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as Brand)}
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--av-colors-border-on-surface-border)',
              background: 'var(--av-colors-background-surface-secondary)',
              color: 'inherit',
            }}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--av-colors-text-on-surface-secondary)' }}>
            {brand === defaultBrand
              ? '(default)'
              : `(${overrides} override${overrides === 1 ? '' : 's'})`}
          </span>
        </label>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            border: '1px solid var(--av-colors-border-on-surface-border)',
            background: 'var(--av-colors-background-surface-secondary)',
            color: 'inherit',
          }}
        >
          {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main
        style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 96px' }}
      >
        {SECTIONS.map(({ id, title, Component }) => (
          <Section key={id} id={id} title={title}>
            <Component />
          </Section>
        ))}
      </main>
    </div>
  );
}
