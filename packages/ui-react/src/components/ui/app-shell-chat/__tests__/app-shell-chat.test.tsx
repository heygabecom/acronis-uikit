import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SidebarPrimary } from '../../sidebar-primary';
import {
  AppShellChat,
  AppShellChatChat,
  AppShellChatChatBody,
  AppShellChatChatHeader,
  AppShellChatContent,
  AppShellChatContentBody,
  AppShellChatContentHeader,
  AppShellChatSidebar,
} from '../app-shell-chat';

describe('AppShellChat', () => {
  it('renders every part', () => {
    const { container } = render(
      <AppShellChat>
        <AppShellChatSidebar>nav</AppShellChatSidebar>
        <AppShellChatContent>
          <AppShellChatContentHeader>header</AppShellChatContentHeader>
          <AppShellChatContentBody>body</AppShellChatContentBody>
        </AppShellChatContent>
        <AppShellChatChat>
          <AppShellChatChatHeader label="Acronis AI" />
          <AppShellChatChatBody>chat</AppShellChatChatBody>
        </AppShellChatChat>
      </AppShellChat>
    );
    expect(
      container.querySelector('[data-slot="app-shell-chat"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('aside[data-slot="app-shell-chat-sidebar"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="app-shell-chat-content"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="app-shell-chat-content-header"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="app-shell-chat-content-body"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('aside[data-slot="app-shell-chat-chat"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="app-shell-chat-chat-header"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="app-shell-chat-chat-body"]')
    ).toBeInTheDocument();
  });

  it('renders with only SidebarPrimary in the rail — SidebarSecondary is optional', () => {
    const { container } = render(
      <AppShellChat>
        <AppShellChatSidebar>
          <SidebarPrimary aria-label="Primary" />
        </AppShellChatSidebar>
        <AppShellChatContent>content</AppShellChatContent>
      </AppShellChat>
    );
    const sidebar = container.querySelector(
      'aside[data-slot="app-shell-chat-sidebar"]'
    );
    expect(sidebar).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    // No second nav landmark — SidebarSecondary was never rendered.
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
  });

  it('shows the chat header label at the default width', () => {
    render(
      <AppShellChatChat>
        <AppShellChatChatHeader label="Acronis AI" />
      </AppShellChatChat>
    );
    expect(screen.getByText('Acronis AI')).toBeInTheDocument();
  });

  it('shows the icon-only rail (no visible label) at the min width', () => {
    const { container } = render(
      <AppShellChatChat width={48}>
        <AppShellChatChatHeader label="Acronis AI" />
      </AppShellChatChat>
    );
    // The Acronis mark renders as an svg…
    expect(container.querySelector('svg')).toBeInTheDocument();
    // …but the label text is not visible (only exposed via the hover tooltip).
    expect(screen.queryByText('Acronis AI')).not.toBeInTheDocument();
    // The chat panel reflects the collapsed (icon-only) visual state.
    expect(
      container.querySelector('[data-slot="app-shell-chat-chat"]')
    ).toHaveAttribute('data-state', 'collapsed');
  });

  it('hides the chat body at the min width', () => {
    render(
      <AppShellChatChat width={48}>
        <AppShellChatChatBody>Chat body</AppShellChatChatBody>
      </AppShellChatChat>
    );
    expect(screen.getByText('Chat body')).toHaveClass('hidden');
  });

  it('renders a resize separator', () => {
    render(
      <AppShellChat>
        <AppShellChatChat>
          <AppShellChatChatBody>Chat</AppShellChatChatBody>
        </AppShellChatChat>
      </AppShellChat>
    );
    expect(
      screen.getByRole('separator', { name: /resize chat/i })
    ).toBeInTheDocument();
  });

  it('double-clicking the resize edge resets the width', async () => {
    const onWidthChange = vi.fn();
    render(
      <AppShellChat>
        <AppShellChatChat width={800} onWidthChange={onWidthChange}>
          <AppShellChatChatBody>Chat</AppShellChatChatBody>
        </AppShellChatChat>
      </AppShellChat>
    );
    const edge = screen.getByRole('separator', { name: /resize chat/i });
    await userEvent.dblClick(edge);
    expect(onWidthChange).toHaveBeenCalledWith(512);
  });

  it('resizes with the arrow keys and resets with Home', async () => {
    const onWidthChange = vi.fn();
    render(
      <AppShellChat>
        <AppShellChatChat onWidthChange={onWidthChange}>
          <AppShellChatChatBody>Chat</AppShellChatChatBody>
        </AppShellChatChat>
      </AppShellChat>
    );
    const edge = screen.getByRole('separator', { name: /resize chat/i });
    edge.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onWidthChange).toHaveBeenLastCalledWith(528);
    await userEvent.keyboard('{ArrowRight}');
    expect(onWidthChange).toHaveBeenLastCalledWith(512);
    await userEvent.keyboard('{Home}');
    expect(onWidthChange).toHaveBeenLastCalledWith(512);
  });

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShellChat ref={ref}>
        <AppShellChatContent>x</AppShellChatContent>
      </AppShellChat>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-slot', 'app-shell-chat');
  });

  it('forwards a ref to the chat panel', () => {
    const chatRef = createRef<HTMLElement>();
    render(
      <AppShellChat>
        <AppShellChatChat ref={chatRef}>
          <AppShellChatChatHeader label="Acronis AI" />
        </AppShellChatChat>
      </AppShellChat>
    );
    expect(chatRef.current?.tagName).toBe('ASIDE');
  });
});
