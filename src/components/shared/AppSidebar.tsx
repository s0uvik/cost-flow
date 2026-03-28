import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  FileText,
  BarChart2,
  Users,
  Building2,
  Settings,
  TrendingUp,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserMenu } from './UserMenu'

const navItems = [
  { title: 'Dashboard', to: '/', icon: LayoutDashboard },
  { title: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { title: 'Categories', to: '/categories', icon: Tag },
  { title: 'Budgets', to: '/budgets', icon: PiggyBank },
]

const businessItems = [
  { title: 'Invoices', to: '/invoices', icon: FileText },
  { title: 'Clients', to: '/clients', icon: Users },
  { title: 'Vendors', to: '/vendors', icon: Building2 },
]

const reportItems = [
  { title: 'Reports', to: '/reports', icon: BarChart2 },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TrendingUp className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">ExpenseTracker</span>
                  <span className="text-xs text-muted-foreground">Business Finance</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} activeProps={{ className: 'bg-sidebar-accent text-sidebar-accent-foreground' }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} activeProps={{ className: 'bg-sidebar-accent text-sidebar-accent-foreground' }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} activeProps={{ className: 'bg-sidebar-accent text-sidebar-accent-foreground' }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings" activeProps={{ className: 'bg-sidebar-accent text-sidebar-accent-foreground' }}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
