'use client';

import {
  SidebarSecondary,
  SidebarSecondaryContent,
  SidebarSecondaryHeader,
  SidebarSecondaryMenu,
  SidebarSecondaryMenuItem,
  SidebarSecondarySection,
  SidebarSecondarySectionLabel,
} from '@acronis-platform/ui-react';
import {
  BoxIcon,
  LayoutGridIcon,
  ServerIcon,
} from '@acronis-platform/icons-react/stroke-mono';

export function SidebarSecondaryDemo() {
  return (
    <div style={{ height: 360, width: 280 }}>
      <SidebarSecondary>
        <SidebarSecondaryHeader label="Protection" />
        <SidebarSecondaryContent>
          <SidebarSecondarySection>
            <SidebarSecondarySectionLabel>Overview</SidebarSecondarySectionLabel>
            <SidebarSecondaryMenu>
              <SidebarSecondaryMenuItem href="#" icon={<LayoutGridIcon />} selected>
                Dashboard
              </SidebarSecondaryMenuItem>
              <SidebarSecondaryMenuItem href="#" icon={<ServerIcon />}>
                Devices
              </SidebarSecondaryMenuItem>
            </SidebarSecondaryMenu>
          </SidebarSecondarySection>
          <SidebarSecondarySection>
            <SidebarSecondarySectionLabel>Configuration</SidebarSecondarySectionLabel>
            <SidebarSecondaryMenu>
              <SidebarSecondaryMenuItem href="#" icon={<BoxIcon />}>
                Backup
              </SidebarSecondaryMenuItem>
              <SidebarSecondaryMenuItem href="#">
                Antivirus
              </SidebarSecondaryMenuItem>
            </SidebarSecondaryMenu>
          </SidebarSecondarySection>
        </SidebarSecondaryContent>
      </SidebarSecondary>
    </div>
  );
}
