import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingIcon } from '@acronis-platform/icons-react/stroke-mono';

import { FilterSearch, FilterSearchActions } from '../filter-search';
import { SearchBox } from '../../search/search';
import { ButtonMenu } from '../../button-menu/button-menu';
import { Button } from '../../button/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../select/select';

const meta = {
  title: 'UI/FilterSearch',
  component: FilterSearch,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for the root container.',
      table: { type: { summary: 'string' }, category: 'Appearance' },
    },
    children: {
      control: false,
      description:
        'Compose Search, ButtonMenu, Select, FilterSearchActions, and other elements as children.',
      table: { type: { summary: 'ReactNode' }, category: 'Content' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[1152px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FilterSearch>
      <SearchBox placeholder="Placeholder" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
    </FilterSearch>
  ),
};

const tenantItems = {
  all: 'All customers',
  acme: 'Acme Corp',
  globex: 'Globex Inc',
};

export const WithTenantSwitcher: Story = {
  render: () => (
    <FilterSearch>
      <Select items={tenantItems} defaultValue="all">
        <SelectTrigger className="w-56">
          <BuildingIcon size={16} className="shrink-0 text-[var(--ui-input-select-normal-icon-expand-color-idle)]" />
          <SelectValue placeholder="All customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All customers</SelectItem>
          <SelectItem value="acme">Acme Corp</SelectItem>
          <SelectItem value="globex">Globex Inc</SelectItem>
        </SelectContent>
      </Select>
      <SearchBox placeholder="Placeholder" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
    </FilterSearch>
  ),
};

export const WithButtons: Story = {
  render: () => (
    <FilterSearch>
      <Select items={tenantItems} defaultValue="all">
        <SelectTrigger className="w-56">
          <BuildingIcon size={16} className="shrink-0 text-[var(--ui-input-select-normal-icon-expand-color-idle)]" />
          <SelectValue placeholder="All customers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All customers</SelectItem>
          <SelectItem value="acme">Acme Corp</SelectItem>
          <SelectItem value="globex">Globex Inc</SelectItem>
        </SelectContent>
      </Select>
      <SearchBox placeholder="Placeholder" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
      <FilterSearchActions>
        <ButtonMenu variant="secondary">Label</ButtonMenu>
        <ButtonMenu variant="secondary">Label</ButtonMenu>
        <Button>Label</Button>
      </FilterSearchActions>
    </FilterSearch>
  ),
};
