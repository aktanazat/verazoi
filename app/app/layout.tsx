import { AppNav } from "@/components/app-nav"
import { AppRouteTransition } from "@/components/app-route-transition"
import { AppSidebar } from "@/components/app-sidebar"
import { AppDataProvider } from "@/contexts/app-data-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppDataProvider>
      <SidebarProvider>
        <div className="flex min-h-dvh">
          <AppSidebar />
          <SidebarInset>
            <main className="px-5 pb-20 pt-6 md:px-10 md:pb-8">
              <AppRouteTransition>{children}</AppRouteTransition>
            </main>
          </SidebarInset>
        </div>
        <AppNav />
      </SidebarProvider>
    </AppDataProvider>
  )
}
