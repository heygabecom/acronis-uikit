// Figma Code Connect — status: COMPLETE
// Mapped to the "Toolbar" component set (node 3897:7199, `state`: active |
// disabled) in the ui-react Figma file. Props: state (variant),
// hasMoreActions (bool), hasCounter (bool), ListActions (slot).
//
// `state` maps to the React `disabled` boolean — the native `<fieldset
// disabled>` cascade (see toolbar.tsx) reproduces Figma's per-state disabled
// treatment of every nested Button/ButtonMenu without a separate prop.
// `hasMoreActions`/`hasCounter` only toggle canvas visibility of the trailing
// ButtonMenu / counter area in Figma — in code that's just whether a
// `ButtonMenu`/`ToolbarActions` child is passed at all, so neither boolean is
// mapped as a distinct prop.
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
    },
    example: ({
      disabled,
      listActions,
    }: {
      disabled: boolean;
      listActions: React.ReactNode;
    }) => (
      <Toolbar disabled={disabled}>
        {listActions}
        <ButtonMenu>More actions</ButtonMenu>
        <ToolbarActions>
          <span>6 items selected:</span>
          <Button variant="ghost">Deselect</Button>
        </ToolbarActions>
      </Toolbar>
    ),
  }
);
