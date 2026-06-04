'use client';

import { ChevronRightIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  tooltipMessage?: string;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.disabled ? (
            <DisabledItem key={item.title} item={item} />
          ) : (
            <ActiveItem key={item.title} item={item} />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ActiveItem({ item }: { item: NavItem }) {
  return (
    <Collapsible
      asChild
      defaultOpen={item.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className="min-h-[56px] text-base"
          >
            {item.icon}
            <span>{item.title}</span>
            <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild>
                  <a href={subItem.url}>
                    <span>{subItem.title}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function DisabledItem({ item }: { item: NavItem }) {
  const tooltip = item.tooltipMessage ?? item.title;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-disabled="true"
        title={tooltip}
        tooltip={tooltip}
        className="min-h-[56px] cursor-not-allowed text-base opacity-50"
        onClick={(event) => event.preventDefault()}
      >
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
