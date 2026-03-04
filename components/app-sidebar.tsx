"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardPen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { label: "Dashboard", href: "/app/dashboard", icon: BarChart3 },
  { label: "Log", href: "/app/log", icon: ClipboardPen },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-serif text-[18px] font-light text-foreground">Verazoi</span>
          <span className="text-[11px] tracking-[0.1em] text-muted-foreground">Demo</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
