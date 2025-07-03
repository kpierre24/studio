
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Settings,
  UserCircle,
  LayoutDashboard,
  BookOpen,
  BarChart2,
  DollarSign,
  Users,
  CalendarCheck,
  MessageSquare,
  Video,
  Megaphone,
  CalendarDays,
  UserPlus,
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { APP_NAME } from '@/lib/constants';

export function AppSidebar() {
  const { state, handleLogoutUser } = useAppContext();
  const { currentUser, directMessages } = state;
  const pathname = usePathname();

  const unreadMessagesCount = currentUser
    ? directMessages.filter(
        (dm) => dm.recipientId === currentUser.id && !dm.read
      ).length
    : 0;

  const getNavLinks = (role: UserRole) => {
    const allLinks = [
      // Common Links
      {
        name: 'Dashboard',
        href:
          role === UserRole.SUPER_ADMIN
            ? '/admin/dashboard'
            : role === UserRole.TEACHER
            ? '/teacher/dashboard'
            : '/student/dashboard',
        icon: LayoutDashboard,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
        badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      },
      // Admin
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        name: 'Courses',
        href: '/admin/courses',
        icon: BookOpen,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        name: 'Enrollments',
        href: '/admin/enrollments',
        icon: UserPlus,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        name: 'Attendance',
        href: '/admin/attendance',
        icon: CalendarCheck,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        name: 'Payments',
        href: '/admin/payments',
        icon: DollarSign,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: BarChart2,
        roles: [UserRole.SUPER_ADMIN],
      },
      // Teacher
      {
        name: 'My Courses',
        href: '/teacher/courses',
        icon: BookOpen,
        roles: [UserRole.TEACHER],
      },
      {
        name: 'Attendance',
        href: '/teacher/attendance',
        icon: CalendarCheck,
        roles: [UserRole.TEACHER],
      },
      {
        name: 'Reports',
        href: '/teacher/reports',
        icon: BarChart2,
        roles: [UserRole.TEACHER],
      },
      // Student
      {
        name: 'My Courses',
        href: '/student/courses',
        icon: BookOpen,
        roles: [UserRole.STUDENT],
      },
      {
        name: 'Live Class',
        href: '/student/live-class',
        icon: Video,
        roles: [UserRole.STUDENT],
      },
      {
        name: 'Attendance',
        href: '/student/attendance',
        icon: CalendarCheck,
        roles: [UserRole.STUDENT],
      },
      {
        name: 'Payments',
        href: '/student/payments',
        icon: DollarSign,
        roles: [UserRole.STUDENT],
      },
    ];

    return allLinks.filter((link) => link.roles.includes(role));
  };

  const navLinks = currentUser ? getNavLinks(currentUser.role) : [];

  const isActive = (href: string) => {
    // Exact match for dashboards or the base reports page
    if (href.endsWith('dashboard') || href === '/admin/reports') {
        return pathname === href;
    }
    // Broader match for other parent routes
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="text-2xl font-headline font-bold text-sidebar-primary group-data-[collapsible=icon]:hidden"
        >
          {APP_NAME}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.name + link.href}>
              <Link href={link.href} passHref>
                <SidebarMenuButton
                  isActive={isActive(link.href)}
                  tooltip={{
                    children: link.name,
                  }}
                >
                  <link.icon />
                  <span>{link.name}</span>
                  {link.badge && (
                     <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">
                        {link.badge}
                    </div>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:-mt-8">
        <div className="flex flex-col gap-2">
           <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/profile" passHref>
                        <SidebarMenuButton tooltip={{children: "Profile"}} isActive={isActive('/profile')}>
                            <UserCircle/>
                            <span>Profile</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/settings" passHref>
                        <SidebarMenuButton tooltip={{children: "Settings"}} isActive={isActive('/settings')}>
                            <Settings/>
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogoutUser} tooltip={{children: "Logout"}}>
                        <LogOut/>
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
