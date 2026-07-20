import type { Meta, StoryObj } from '@storybook/react-vite';

import { ButtonMenu } from '../../button-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Open on mount, uncontrolled.',
      table: { type: { summary: 'boolean' }, category: 'State' },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state. Pair with `onOpenChange`.',
      table: { type: { summary: 'boolean' }, category: 'State' },
    },
    onOpenChange: {
      control: false,
      description: 'Fires when the menu opens or closes.',
      table: { type: { summary: '(open, eventDetails) => void' }, category: 'Events' },
    },
    children: {
      control: false,
      description: 'A `DropdownMenuTrigger` and a `DropdownMenuContent` of items.',
      table: { type: { summary: 'ReactNode' }, category: 'Content' },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single section with items — ButtonMenu trigger + Figma Section(firstSection=true). */
export const Default: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<ButtonMenu variant="secondary">Actions</ButtonMenu>} />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Multiple sections — non-first sections get an auto top-border separator (Figma firstSection=false). */
export const MultipleSections: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<ButtonMenu variant="secondary">Actions</ButtonMenu>} />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Cascade submenu — Item with ItemExtras(variant=cascade) opens a nested dropdown. */
export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<ButtonMenu variant="primary">Actions</ButtonMenu>} />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Slack</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
