// Figma Code Connect — status: COMPLETE
// Mapped to the "Primary Sidebar" frame in the ui-react Figma file (node
// 3484-2105): SidebarPrimary (256) | Content (flex-1) | Chat (512). The Chat
// panel resizes against Content, down to an icon-only rail and up to full
// width — no separate collapse or full-width control in code.
import figma from '@figma/code-connect';

import {
  AppShellChat,
  AppShellChatChat,
  AppShellChatChatBody,
  AppShellChatChatHeader,
  AppShellChatContent,
  AppShellChatContentBody,
  AppShellChatContentHeader,
  AppShellChatSidebar,
} from './app-shell-chat';

figma.connect(
  AppShellChat,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/ui-react?node-id=3484-2105',
  {
    example: () => (
      <AppShellChat>
        <AppShellChatSidebar>{/* SidebarPrimary [+ SidebarSecondary] */}</AppShellChatSidebar>
        <AppShellChatContent>
          <AppShellChatContentHeader>{/* page title */}</AppShellChatContentHeader>
          <AppShellChatContentBody>{/* page content */}</AppShellChatContentBody>
        </AppShellChatContent>
        <AppShellChatChat>
          <AppShellChatChatHeader label="Acronis AI" />
          <AppShellChatChatBody>{/* chat content */}</AppShellChatChatBody>
        </AppShellChatChat>
      </AppShellChat>
    ),
  }
);
