import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { TablePagination } from '../table-pagination';

const meta = {
  title: 'UI/Table/Pagination',
  component: TablePagination,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    pageIndex: 0,
    pageCount: 5,
    pageSize: 10,
    onPageIndexChange: () => {},
    onPageSizeChange: () => {},
  },
} satisfies Meta<typeof TablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractivePagination() {
  const [pageIndex, setPageIndex] = useState(2);
  const [pageSize, setPageSize] = useState(10);
  return (
    <div className="w-[720px]">
      <TablePagination
        pageIndex={pageIndex}
        pageCount={5}
        pageSize={pageSize}
        totalRows={48}
        selectedRows={4}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractivePagination />,
};

export const FirstPage: Story = {
  args: {
    pageIndex: 0,
    pageCount: 5,
    pageSize: 10,
    totalRows: 48,
    onPageIndexChange: () => {},
    onPageSizeChange: () => {},
  },
  render: (args) => (
    <div className="w-[720px]">
      <TablePagination {...args} />
    </div>
  ),
};
