// Figma Code Connect — status: COMPLETE
// Mapped to the "Toolbar" component set (node 3897:7199, `state`: active |
// disabled) in the ui-react Figma file. Props: state (variant),
// hasMoreActions (bool), hasCounter (bool), ListActions (slot).
//
// `state` maps to the React `disabled` boolean — the native `<fieldset
// disabled>` cascade (see toolbar.tsx) reproduces Figma's per-state disabled
// treatment of every nested Button/ButtonMenu without a separate prop.
// `hasMoreActions`/`hasCounter` each gate whether the generated example
// includes the trailing `ButtonMenu` / `ToolbarActions` child at all — same
// canvas-only-boolean pattern as `FilterSearch`'s `hasTenants`/`hasFilters`.
import * as React from 'react';
import figma from '@figma/code-connect';

import { Toolbar, ToolbarActions } from './toolbar';
import { Button } from '../button/button';
import { ButtonMenu } from '../button-menu/button-menu';

figma.connect(
  Toolbar,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/ui-react?node-id=3897-7199',
  {
    props: {
      disabled: figma.enum('state', {
        active: false,
        disabled: true,
      }),
      listActions: figma.children('ListActions'),
      moreActions: figma.boolean('hasMoreActions', {
        true: <ButtonMenu>More actions</ButtonMenu>,
        false: undefined,
      }),
      counter: figma.boolean('hasCounter', {
        true: (
          <ToolbarActions>
            <span>6 items selected:</span>
            <Button variant="ghost">Deselect</Button>
          </ToolbarActions>
        ),
        false: undefined,
      }),
    },
    example: ({
      disabled,
      listActions,
      moreActions,
      counter,
    }: {
      disabled: boolean;
      listActions: React.ReactNode;
      moreActions: React.ReactNode;
      counter: React.ReactNode;
    }) => (
      <Toolbar disabled={disabled}>
        {listActions}
        {moreActions}
        {counter}
      </Toolbar>
    ),
  }
);
