import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toolbar, ToolbarActions, ToolbarActionList } from '../toolbar';
import { Button } from '../../button/button';
import { ButtonMenu } from '../../button-menu/button-menu';

const FIVE_ACTIONS = [
  { key: 'first', label: 'First action' },
  { key: 'second', label: 'Second action' },
  { key: 'third', label: 'Third action' },
  { key: 'fourth', label: 'Fourth action' },
  { key: 'fifth', label: 'Fifth action' },
];

const meta = {
  title: 'UI/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description:
        'Disables every nested Button/ButtonMenu via the native `<fieldset disabled>` cascade.',
      table: { type: { summary: 'boolean' }, category: 'State' },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the root container.',
      table: { type: { summary: 'string' }, category: 'Appearance' },
    },
    children: {
      control: false,
      description:
        'List-action controls, an optional ButtonMenu, and an optional trailing ToolbarActions child.',
      table: { type: { summary: 'ReactNode' }, category: 'Content' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[1152px] px-4 py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toolbar>
      <Button variant="ghost">First action</Button>
      <Button variant="ghost">Second action</Button>
      <Button variant="ghost">Third action</Button>
    </Toolbar>
  ),
};

export const MoreActions: Story = {
  render: () => (
    <Toolbar>
      <Button variant="ghost">First action</Button>
      <Button variant="ghost">Second action</Button>
      <ButtonMenu variant="secondary">More actions</ButtonMenu>
    </Toolbar>
  ),
};

export const WithSelectionCounter: Story = {
  render: () => (
    <Toolbar>
      <Button variant="ghost">First action</Button>
      <Button variant="ghost">Second action</Button>
      <ButtonMenu variant="secondary">More actions</ButtonMenu>
      <ToolbarActions>
        <span className="text-sm text-[var(--ui-text-on-surface-primary)]">
          6 items selected:
        </span>
        <Button variant="ghost">Deselect</Button>
      </ToolbarActions>
    </Toolbar>
  ),
};

export const StatusRow: Story = {
  render: () => (
    <Toolbar>
      <Button variant="ghost">First action</Button>
      <ToolbarActions>
        <span className="text-sm text-[var(--ui-text-on-surface-secondary)]">
          25 of 1250 items loaded
        </span>
      </ToolbarActions>
    </Toolbar>
  ),
};

export const AutoCollapseFits: Story = {
  name: 'Auto-Collapse (Fits)',
  render: () => (
    <Toolbar>
      <ToolbarActionList actions={FIVE_ACTIONS} />
      <ToolbarActions>
        <span className="text-sm text-[var(--ui-text-on-surface-primary)]">
          6 items selected:
        </span>
        <Button variant="ghost">Deselect</Button>
      </ToolbarActions>
    </Toolbar>
  ),
};

export const AutoCollapseNarrow: Story = {
  name: 'Auto-Collapse (Narrow)',
  render: () => (
    // Fixed width, independent of the story viewport — deterministically
    // too narrow for all 5 actions, forcing the trailing ones into
    // "More actions" (Figma breakpoints spec, node 6262:28276).
    <div className="w-[320px]">
      <Toolbar>
        <ToolbarActionList actions={FIVE_ACTIONS} />
        <ToolbarActions>
          <span className="text-sm text-[var(--ui-text-on-surface-primary)]">
            6 items selected:
          </span>
          <Button variant="ghost">Deselect</Button>
        </ToolbarActions>
      </Toolbar>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Toolbar disabled>
      <Button variant="ghost">First action</Button>
      <Button variant="ghost">Second action</Button>
      <ButtonMenu variant="secondary">More actions</ButtonMenu>
      <ToolbarActions>
        <span className="text-sm text-[var(--ui-text-on-surface-primary)]">
          6 items selected:
        </span>
        <Button variant="ghost">Deselect</Button>
      </ToolbarActions>
    </Toolbar>
  ),
};
