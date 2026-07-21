// Figma Code Connect — status: COMPLETE
// Mapped to the "PageHeader" master component (ui-react file, node 2905-7678).
// The Figma component models the tags/actions slots and the edit affordance
// as boolean/slot properties on a single node; ui-react models the same
// anatomy as composable parts instead, so `props` only covers the plain
// `title` text — the rest is shown via the `example` composition. Note the
// Figma property is spelled `eidtable` (a typo in the source file) — not
// referenced here since the title-edit button isn't mapped to a code prop.
import figma from '@figma/code-connect';

import { PencilIcon } from '@acronis-platform/icons-react/stroke-mono';

import { Button } from '../button';
import { ButtonIcon } from '../button-icon';
import { Tag } from '../tag';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderDescriptionRow,
  PageHeaderRow,
  PageHeaderTags,
  PageHeaderTitle,
} from './page-header';

figma.connect(
  PageHeader,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/ui-react?node-id=2905-7678',
  {
    props: {
      title: figma.string('title'),
    },
    example: ({ title }) => (
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderTitle>{title}</PageHeaderTitle>
          <ButtonIcon variant="secondary" aria-label="Edit title">
            <PencilIcon size={16} />
          </ButtonIcon>
          <PageHeaderTags>
            <Tag variant="info">Customer</Tag>
          </PageHeaderTags>
          <PageHeaderActions>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </PageHeaderActions>
        </PageHeaderRow>
        <PageHeaderDescriptionRow>
          <PageHeaderDescription>Description</PageHeaderDescription>
          <ButtonIcon variant="secondary" aria-label="Edit description">
            <PencilIcon size={16} />
          </ButtonIcon>
        </PageHeaderDescriptionRow>
      </PageHeader>
    ),
  }
);
