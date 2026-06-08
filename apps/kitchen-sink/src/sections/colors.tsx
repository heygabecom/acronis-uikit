import {
  componentGroups,
  resolveToken,
  semanticContextGroups,
  statusExtras,
  statusMatrix,
  type ContextGroup,
  type RoleGroup,
  type StatusCellKind,
  type TokenGroup,
} from '@/lib/tokens';

const SWATCH_BORDER = '1px solid var(--ui-border-on-surface-border)';

/** A value that can be shown as a color/gradient swatch. */
function isColorValue(value: string): boolean {
  return /^(#|rgb|hsl|light-dark|linear-gradient|radial-gradient|var\()/.test(
    value
  );
}

const ROLE_LABELS: Record<string, string> = {
  bg: 'Background',
  text: 'Text',
  border: 'Border',
  glyph: 'Glyph',
  focus: 'Focus',
};

/** One token: a swatch (colors/gradients) or a value chip (dimensions/etc.),
 *  with a compact `label` up top and the full `--ui-*` name below. */
function TokenCard({ name, label }: { name: string; label?: string }) {
  const value = resolveToken(name);
  const isColor = isColorValue(value);
  return (
    <div style={{ minWidth: 0 }}>
      {isColor ? (
        <div
          style={{
            height: 44,
            borderRadius: 6,
            background: `var(${name})`,
            border: SWATCH_BORDER,
          }}
        />
      ) : (
        <div
          style={{
            height: 44,
            borderRadius: 6,
            border: SWATCH_BORDER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            fontSize: 12,
            fontFamily: 'monospace',
            color: 'var(--ui-text-on-surface-primary)',
            background: 'var(--ui-background-surface-secondary)',
            overflow: 'hidden',
          }}
        >
          {value || '—'}
        </div>
      )}
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            marginTop: 4,
            color: 'var(--ui-text-on-surface-primary)',
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 10,
          fontFamily: 'monospace',
          marginTop: label ? 1 : 4,
          wordBreak: 'break-all',
          color: 'var(--ui-text-on-surface-secondary)',
        }}
      >
        {name}
      </div>
      {isColor && (
        <div
          style={{
            fontSize: 9,
            color: 'var(--ui-text-on-surface-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 12,
} as const;

/** A role row within a context — small role label, then its swatches. */
function RoleRow({ group }: { group: RoleGroup }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--ui-text-on-surface-secondary)',
        }}
      >
        {ROLE_LABELS[group.role] ?? group.role}{' '}
        <span style={{ fontWeight: 400, opacity: 0.7 }}>
          ({group.tokens.length})
        </span>
      </div>
      <div style={cardGrid}>
        {group.tokens.map((token) => (
          <TokenCard key={token.name} name={token.name} label={token.leaf} />
        ))}
      </div>
    </div>
  );
}

/** A single matrix cell, previewed per what its column paints. */
function MatrixCell({
  kind,
  name,
}: {
  kind: StatusCellKind;
  name: string | null;
}) {
  if (!name) {
    return (
      <span style={{ opacity: 0.3, color: 'var(--ui-text-on-surface-secondary)' }}>
        –
      </span>
    );
  }
  const box = {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: SWATCH_BORDER,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  } as const;
  if (kind === 'fill') {
    return <div title={name} style={{ ...box, background: `var(${name})` }} />;
  }
  if (kind === 'border') {
    return <div title={name} style={{ ...box, border: `2px solid var(${name})` }} />;
  }
  const fg = {
    ...box,
    color: `var(${name})`,
    background: 'var(--ui-background-surface-secondary)',
  } as const;
  return kind === 'text' ? (
    <div title={name} style={{ ...fg, fontSize: 12, fontWeight: 700 }}>
      Aa
    </div>
  ) : (
    <div title={name} style={{ ...fg, fontSize: 15 }}>
      ●
    </div>
  );
}

const matrixTh = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: 'var(--ui-text-on-surface-secondary)',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
} as const;

/** Status rendered as an intent × (role/state) matrix. Hover a cell for its
 *  full `--ui-*` name. */
function StatusMatrix() {
  // Left border between column groups makes the grouping legible.
  const divider = '1px solid var(--ui-border-on-surface-divider)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...matrixTh, textAlign: 'left' }} rowSpan={2} />
              {statusMatrix.groups.map((g) => (
                <th
                  key={g.label}
                  colSpan={g.columns.length}
                  style={{
                    ...matrixTh,
                    textAlign: 'center',
                    borderLeft: divider,
                    borderBottom: divider,
                  }}
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr>
              {statusMatrix.groups.flatMap((g) =>
                g.columns.map((c, ci) => (
                  <th
                    key={`${g.label}-${c}`}
                    style={{
                      ...matrixTh,
                      textAlign: 'center',
                      borderLeft: ci === 0 ? divider : undefined,
                    }}
                  >
                    {c}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {statusMatrix.intents.map((intent) => (
              <tr key={intent}>
                <th
                  style={{
                    ...matrixTh,
                    textAlign: 'left',
                    color: 'var(--ui-text-on-surface-primary)',
                  }}
                >
                  {intent}
                </th>
                {statusMatrix.groups.flatMap((g, gi) =>
                  g.cells[intent].map((name, ci) => (
                    <td
                      key={`${g.label}-${intent}-${ci}`}
                      style={{
                        padding: 6,
                        borderLeft: gi > 0 && ci === 0 ? divider : undefined,
                      }}
                    >
                      <MatrixCell kind={g.kind} name={name} />
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {statusExtras.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: 'var(--ui-text-on-surface-secondary)',
            }}
          >
            Other status tokens
          </div>
          {statusExtras.map((role) => (
            <RoleRow key={role.role} group={role} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A context section (Surface, Brand, Status, …) holding its role rows. */
function ContextSection({ group }: { group: ContextGroup }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        borderRadius: 8,
        border: SWATCH_BORDER,
        background: 'var(--ui-background-surface-primary)',
      }}
    >
      <h4
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          margin: 0,
        }}
      >
        {group.context}{' '}
        <span style={{ fontWeight: 400, opacity: 0.6 }}>({group.count})</span>
      </h4>
      {group.context === 'status' ? (
        <StatusMatrix />
      ) : (
        group.roles.map((role) => <RoleRow key={role.role} group={role} />)
      )}
    </div>
  );
}

/** Per-component token group (`--ui-button-*`, …) — flat grid, grouped by name. */
function ComponentGroup({ group }: { group: TokenGroup }) {
  return (
    <div>
      <h3
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          opacity: 0.6,
          marginBottom: 10,
        }}
      >
        {group.tier} <span style={{ fontWeight: 400 }}>({group.tokens.length})</span>
      </h3>
      <div style={cardGrid}>
        {group.tokens.map((token) => (
          <TokenCard key={token.name} name={token.name} />
        ))}
      </div>
    </div>
  );
}

export function ColorsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <p style={{ fontSize: 13, color: 'var(--ui-text-on-surface-secondary)' }}>
        Generated <code>--ui-*</code> tokens from{' '}
        <code>@acronis-platform/tokens-pd</code>. Values reflect the active brand
        and light/dark scheme. Semantic colors are grouped by{' '}
        <strong>context</strong> (the surface/intent a color lives on), then by{' '}
        <strong>role</strong> (background, text, border, glyph) within.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Semantic colors</h3>
        {semanticContextGroups.map((group) => (
          <ContextSection key={group.context} group={group} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Component tokens</h3>
        {componentGroups.map((group) => (
          <ComponentGroup key={group.tier} group={group} />
        ))}
      </div>
    </div>
  );
}
