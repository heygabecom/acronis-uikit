import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ButtonDisabled,
  ButtonSizes,
  ButtonTranslucent,
  ButtonVariants,
} from '@acronis-platform/shadcn-uikit-demos/button';

/**
 * These stories render the **shared demos** from
 * `@acronis-platform/shadcn-uikit-demos` — the exact same source `apps/demo`
 * and `apps/docs` use for the legacy library. The demos import the legacy
 * package specifier, which this Storybook's Vite config aliases to
 * `@acronis-platform/ui-react`, so the same demo code renders against this
 * library's components.
 */
const meta = {
  title: 'UI/Button/Shared Demos',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = { render: () => <ButtonVariants /> };
export const Sizes: Story = { render: () => <ButtonSizes /> };
export const Disabled: Story = { render: () => <ButtonDisabled /> };
export const Translucent: Story = { render: () => <ButtonTranslucent /> };
