// Figma Code Connect — status: COMPLETE
// Mapped to the "ButtonMenuDropdown" component set in the ui-react Figma file.
// The Figma component represents the popup panel; the trigger (ButtonMenu) has
// its own Code Connect in button-menu/button-menu.figma.tsx.
import figma from '@figma/code-connect';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

figma.connect(
  DropdownMenuContent,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/ui-react?node-id=3116-60887',
  {
    props: {
      children: figma.children('sectionList'),
    },
    example: ({ children }) => (
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }
);
