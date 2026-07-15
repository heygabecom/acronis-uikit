'use client';

import * as React from 'react';
import { DateRangePicker, type DateRange } from '@acronis-platform/ui-react';

// NOTE: `DateRangePicker` composes an internal `PopoverContent` (the calendar +
// editable fields + footer) but does not expose a `portalContainer` prop to
// forward down to it, so the open popover portals to `document.body` — outside
// this preview's shadow root — and renders with the document's global styles
// rather than ui-react's. The closed trigger below previews correctly; the open
// panel is best viewed in Storybook. Reconcile once the Figma design lands.
export function DateRangePickerDemo() {
  const [range, setRange] = React.useState<DateRange>({
    from: new Date(2026, 6, 1),
    to: new Date(2026, 6, 15),
  });

  return (
    <div style={{ width: 288 }}>
      <DateRangePicker
        label="Period"
        placeholder="Select a date range"
        value={range}
        onValueChange={setRange}
      />
    </div>
  );
}
