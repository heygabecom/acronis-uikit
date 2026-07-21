'use client';

import { PencilIcon } from '@acronis-platform/icons-react/stroke-mono';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonIcon,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderDescriptionRow,
  PageHeaderRow,
  PageHeaderTags,
  PageHeaderTitle,
  Tag,
} from '@acronis-platform/ui-react';

export function PageHeaderDemo() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reports</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderTitle>Reports</PageHeaderTitle>
          <ButtonIcon variant="secondary" aria-label="Edit title">
            <PencilIcon size={16} />
          </ButtonIcon>
          <PageHeaderTags>
            <Tag variant="info">Customer</Tag>
          </PageHeaderTags>
          <PageHeaderActions>
            <Button variant="ghost">Export</Button>
            <Button>New report</Button>
          </PageHeaderActions>
        </PageHeaderRow>
        <PageHeaderDescriptionRow>
          <PageHeaderDescription>
            All scheduled and on-demand reports for your workloads.
          </PageHeaderDescription>
        </PageHeaderDescriptionRow>
      </PageHeader>
    </div>
  );
}
