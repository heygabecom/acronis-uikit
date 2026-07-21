import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../button';
import { ButtonMenu } from '../../button-menu';
import { Tag } from '../../tag';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderDescriptionRow,
  PageHeaderRow,
  PageHeaderTags,
  PageHeaderTitle,
} from '../page-header';

// Design/QA aid mirroring `src/stories/breakpoints-demo.stories.tsx` — verifies
// PageHeader's own responsive behavior (title never wraps; tags collapse to
// the first tag + a "+#" tag, and secondary buttons collapse under a "More"
// ButtonIcon, per the Figma "Breakpoints" page's two hard requirements) at
// the breakpoint scale pinned in `src/styles/index.css`, rather than adding
// any breakpoint-specific CSS to the component itself (it's already fluid).
// Named viewports scoped to this story only, matching the Figma "Breakpoints"
// page for PageHeader (1024 / 1280 / 1440 / 1680 / 1920).
const BREAKPOINT_VIEWPORTS = {
  lg: {
    name: 'lg — 1024px',
    styles: { width: '1024px', height: '200px' },
    type: 'desktop',
  },
  xl: {
    name: 'xl — 1280px',
    styles: { width: '1280px', height: '200px' },
    type: 'desktop',
  },
  '2xl': {
    name: '2xl — 1440px',
    styles: { width: '1440px', height: '200px' },
    type: 'desktop',
  },
  '3xl': {
    name: '3xl — 1680px',
    styles: { width: '1680px', height: '200px' },
    type: 'desktop',
  },
  '4xl': {
    name: '4xl — 1920px',
    styles: { width: '1920px', height: '200px' },
    type: 'desktop',
  },
} as const;

const DESCRIPTION_TEXT =
  "The first time you land on a section I'll explain what it's for, how it relates to the rest of the console, and the common workflows partners use.";

const meta = {
  title: 'UI/PageHeader/Responsive',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    viewport: { options: BREAKPOINT_VIEWPORTS },
    // Manual, toolbar-driven viewport picker — a snapshot at the default
    // viewport wouldn't exercise this story's purpose. VR is already covered
    // by the fixed-width hand-written stories in page-header.stories.tsx.
    snapshot: { skip: true },
    docs: {
      description: {
        component:
          'Live demo of PageHeader at each pinned breakpoint (lg/xl/2xl/3xl/4xl from ' +
          '`src/styles/index.css`). Pick a named viewport from the toolbar above to see ' +
          'tags and actions collapse — the title never wraps; tags fold into a "+#" tag ' +
          'and secondary buttons fold under a "More" ButtonIcon before either would.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Responsive: Story = {
  render: () => (
    <div className="p-4">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderTitle>Page header</PageHeaderTitle>
          <PageHeaderTags>
            <Tag variant="info">Customer</Tag>
            <Tag variant="success">Active</Tag>
            <Tag variant="warning">Warning</Tag>
          </PageHeaderTags>
          <PageHeaderActions>
            <Button variant="secondary">Quick access</Button>
            <Button variant="secondary">Export data</Button>
            <ButtonMenu>Add user</ButtonMenu>
          </PageHeaderActions>
        </PageHeaderRow>
        <PageHeaderDescriptionRow>
          <PageHeaderDescription>{DESCRIPTION_TEXT}</PageHeaderDescription>
        </PageHeaderDescriptionRow>
      </PageHeader>
    </div>
  ),
};
