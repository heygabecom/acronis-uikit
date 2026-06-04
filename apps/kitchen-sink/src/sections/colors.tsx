import { groups, type TokenGroup } from '@acronis-platform/design-theme/js';

import { resolveToken } from '@/lib/tokens';

const SWATCH_BORDER = '1px solid var(--av-colors-border-on-surface-border)';

function GroupHeading({ label, count }: { label: string; count: number }) {
  return (
    <h3
      style={{
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.6,
        marginBottom: 10,
      }}
    >
      {label} <span style={{ fontWeight: 400 }}>({count})</span>
    </h3>
  );
}

/** Semantic groups: a labelled grid of swatch cards. */
function SemanticGroup({ group }: { group: TokenGroup }) {
  return (
    <div>
      <GroupHeading label={group.label} count={group.tokens.length} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {group.tokens.map((token) => {
          const cssVar = `--av-${token.name}`;
          return (
            <div key={token.name} style={{ minWidth: 0 }}>
              <div
                style={{
                  height: 44,
                  borderRadius: 6,
                  background: `var(${cssVar})`,
                  border: SWATCH_BORDER,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 4 }}>
                {token.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--av-colors-text-on-surface-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {resolveToken(cssVar)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Palette families: a contiguous ramp with shade labels underneath. */
function PaletteRamp({ group }: { group: TokenGroup }) {
  const family = group.label.replace('palette · ', '');
  return (
    <div>
      <GroupHeading label={family} count={group.tokens.length} />
      <div
        style={{ borderRadius: 8, overflow: 'hidden', border: SWATCH_BORDER }}
      >
        <div style={{ display: 'flex' }}>
          {group.tokens.map((token) => {
            const cssVar = `--av-${token.name}`;
            return (
              <div
                key={token.name}
                title={`${token.label}\n${resolveToken(cssVar)}`}
                style={{ flex: 1, height: 48, background: `var(${cssVar})` }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: 'flex',
            background: 'var(--av-colors-background-surface-secondary)',
          }}
        >
          {group.tokens.map((token) => (
            <span
              key={token.name}
              style={{
                flex: 1,
                fontSize: 9,
                textAlign: 'center',
                padding: '2px 0',
                color: 'var(--av-colors-text-on-surface-secondary)',
              }}
            >
              {token.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ColorsSection() {
  const semantic = groups.filter((g) => !g.label.startsWith('palette ·'));
  const palette = groups.filter((g) => g.label.startsWith('palette ·'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Semantic</h3>
        {semantic.map((group) => (
          <SemanticGroup key={group.label} group={group} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Palette</h3>
        {palette.map((group) => (
          <PaletteRamp key={group.label} group={group} />
        ))}
      </div>
    </div>
  );
}
