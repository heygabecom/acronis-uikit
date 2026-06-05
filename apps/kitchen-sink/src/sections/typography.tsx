import { typographyStyles, type TypographyStyle } from '@/lib/tokens';

/** Preferred display order; any unlisted groups are appended after these. */
const GROUP_ORDER = ['headings', 'body', 'link', 'caption', 'note', 'fineprint'];

const SAMPLE = 'The quick brown fox jumps over the lazy dog';

function GroupHeading({ label, count }: { label: string; count: number }) {
  return (
    <h3
      style={{
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.6,
        marginBottom: 4,
      }}
    >
      {label} <span style={{ fontWeight: 400 }}>({count})</span>
    </h3>
  );
}

/** A single typography token: live sample text + its name and metrics. */
function StyleRow({ style }: { style: TypographyStyle }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid var(--ui-border-on-surface-divider)',
      }}
    >
      <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
        <span className={style.className}>{SAMPLE}</span>
      </div>
      <div
        style={{
          flex: '0 0 auto',
          fontFamily: 'monospace',
          fontSize: 11,
          textAlign: 'right',
          color: 'var(--ui-text-on-surface-secondary)',
        }}
      >
        <div style={{ color: 'var(--ui-text-on-surface-primary)' }}>
          .{style.className}
        </div>
        <div>
          {style.fontSize} / {style.lineHeight} · {style.fontWeight}
          {style.letterSpacing && style.letterSpacing !== '0px'
            ? ` · ${style.letterSpacing}`
            : ''}
        </div>
      </div>
    </div>
  );
}

export function TypographySection() {
  const seen = new Set<string>();
  const orderedGroups = [
    ...GROUP_ORDER,
    ...typographyStyles
      .map((s) => s.group)
      .filter((g) => !GROUP_ORDER.includes(g)),
  ].filter((g) => (seen.has(g) ? false : seen.add(g)));

  const groups = orderedGroups
    .map((group) => ({
      group,
      items: typographyStyles.filter((s) => s.group === group),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <p style={{ fontSize: 13, color: 'var(--ui-text-on-surface-secondary)' }}>
        Typography tokens from <code>@acronis-platform/tokens-pd</code>, emitted
        as <code>.ui-typography-*</code> utility classes. Samples render live, so
        the font of the active brand applies.
      </p>

      {groups.map(({ group, items }) => (
        <div key={group}>
          <GroupHeading label={group} count={items.length} />
          <div>
            {items.map((style) => (
              <StyleRow key={style.className} style={style} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
