import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BuildingIcon } from '@acronis-platform/icons-react/stroke-mono';

import {
  FilterSearch,
  FilterSearchActions,
  FilterSearchAppliedFilters,
  FilterSearchFilters,
  useFilterSearchFilters,
} from '../filter-search';
import { InputSearch as Search } from '../../input-search/input-search';
import { ButtonMenu } from '../../button-menu/button-menu';
import { Button } from '../../button/button';
import { InputDatePicker } from '../../input-date-picker/input-date-picker';
import { Separator } from '../../separator/separator';
import {
  InputSelect,
  InputSelectContent,
  InputSelectField,
  InputSelectItem,
  InputSelectLabel,
  InputSelectTrigger,
  InputSelectValue,
} from '../../input-select/input-select';
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
    // FilterSearch itself carries no padding — outer spacing is the
    // consumer's call (e.g. a page/card shell). The story canvas provides it
    // here so the toolbar row and any sibling row (FilterSearchAppliedFilters)
    // share the same left edge instead of drifting apart.
    (Story) => (
      <div className="w-full max-w-[1152px] px-4 py-6">
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
      <Search placeholder="Placeholder" aria-label="Search" className="w-56" />
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
      <Search placeholder="Placeholder" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
    </FilterSearch>
  ),
};

// --- Example filter fields, each bound to the draft via the context hook. ---

const TYPE_ITEMS = { all: 'All', device: 'Device', workload: 'Workload' };
const PRICING_ITEMS = { all: 'All', trial: 'Trial', paid: 'Paid' };
const STATUS_ITEMS = { all: 'All', active: 'Active', disabled: 'Disabled' };
const MANAGEMENT_ITEMS = { all: 'All', managed: 'Managed', unmanaged: 'Unmanaged' };
const BILLING_ITEMS = { all: 'All', monthly: 'Monthly', annual: 'Annual' };

function SelectField({
  filterKey,
  label,
  items,
}: {
  filterKey: string;
  label: string;
  items: Record<string, string>;
}) {
  const { filters, setFilter } = useFilterSearchFilters();
  const value = (filters[filterKey] as string) ?? 'all';
  return (
    <InputSelect
      items={items}
      value={value}
      onValueChange={(next) => setFilter(filterKey, next)}
    >
      <InputSelectField>
        <InputSelectLabel>{label}</InputSelectLabel>
        <InputSelectTrigger>
          <InputSelectValue />
        </InputSelectTrigger>
      </InputSelectField>
      <InputSelectContent>
        {Object.entries(items).map(([key, itemLabel]) => (
          <InputSelectItem key={key} value={key}>
            {itemLabel}
          </InputSelectItem>
        ))}
      </InputSelectContent>
    </InputSelect>
  );
}

function CeoBirthdayField() {
  const { filters, setFilter } = useFilterSearchFilters();
  return (
    <InputDatePicker
      label="CEO birthday"
      placeholder="Select date"
      value={(filters.ceoBirthday as string) ?? undefined}
      onClick={() => setFilter('ceoBirthday', '2001-01-01')}
    />
  );
}

function DeviceFilterFields() {
  return (
    <>
      <SelectField filterKey="type" label="Type" items={TYPE_ITEMS} />
      <SelectField filterKey="pricingMode" label="Pricing mode" items={PRICING_ITEMS} />
      <SelectField filterKey="status" label="Status" items={STATUS_ITEMS} />
      <SelectField filterKey="management" label="Management" items={MANAGEMENT_ITEMS} />
      <SelectField filterKey="billingMode" label="Billing mode" items={BILLING_ITEMS} />
      <Separator />
      <CeoBirthdayField />
    </>
  );
}

function getDeviceFilterChipLabel(key: string, value: unknown): React.ReactNode {
  const labelByKey: Record<string, string> = {
    type: 'Type',
    pricingMode: 'Pricing mode',
    status: 'Status',
    management: 'Management',
    billingMode: 'Billing mode',
    ceoBirthday: 'CEO birthday',
  };
  return `${labelByKey[key] ?? key}: ${String(value)}`;
}

// A controlled wrapper so the story reflects real applied-filter state, laid
// out as two stacked rows — the toolbar, then the applied-filter chips —
// matching the real "Table filters" screen this was modeled on.
function FilterSearchWithFiltersExample({
  initialFilters,
}: {
  initialFilters?: Record<string, unknown>;
}) {
  const [filters, setFilters] = React.useState<Record<string, unknown>>(
    initialFilters ?? {}
  );
  return (
    <div className="flex flex-col gap-3">
      <FilterSearch>
        <Select items={tenantItems} defaultValue="acme">
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
        <Search placeholder="Enter text to filter" aria-label="Search" className="w-56" />
        <FilterSearchFilters value={filters} onValueChange={setFilters} label="Table filters">
          <DeviceFilterFields />
        </FilterSearchFilters>
      </FilterSearch>
      <FilterSearchAppliedFilters
        filters={filters}
        onValueChange={setFilters}
        getFilterChipLabel={getDeviceFilterChipLabel}
      />
    </div>
  );
}

export const WithFiltersAndChips: Story = {
  name: 'With filter popover and applied-filter chips',
  render: () => (
    <FilterSearchWithFiltersExample initialFilters={{ pricingMode: 'trial' }} />
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
      <Search placeholder="Placeholder" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
      <FilterSearchActions>
        <ButtonMenu variant="secondary">Label</ButtonMenu>
        <ButtonMenu variant="secondary">Label</ButtonMenu>
        <Button>Label</Button>
      </FilterSearchActions>
    </FilterSearch>
  ),
};
