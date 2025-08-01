"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
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
  Home,
  Menu,
  X,
  Search,
  MessageCircle,
  ListChecks,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number;
}

interface MobileNavigationProps {
  variant?: 'bottom-tabs' | 'hamburger';
  className?: string;
}

export function MobileNavigation({ 
  variant = 'bottom-tabs', 
  className 
}: MobileNavigationProps) {
  const { state } = useAppContext();
  const { currentUser, directMessages } = state;
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render on desktop
  if (!isMobile) return null;

  const unreadMessagesCount = currentUser
    ? directMessages.filter(
        (dm) => dm.recipientId === currentUser.id && !dm.read
      ).length
    : 0;

  const getNavItems = (role: UserRole): NavItem[] => {
    const allItems: NavItem[] = [
      // Common items for bottom tabs (most important)
      {
        name: 'Home',
        href:
          role === UserRole.SUPER_ADMIN
            ? '/admin/dashboard'
            : role === UserRole.TEACHER
            ? '/teacher/dashboard'
            : '/student/dashboard',
        icon: Home,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Courses',
        href:
          role === UserRole.SUPER_ADMIN
            ? '/admin/courses'
            : role === UserRole.TEACHER
            ? '/teacher/courses'
            : '/student/courses',
        icon: BookOpen,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
        badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      },
      {
        name: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Menu',
        href: '#',
        icon: Menu,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
    ];

    return allItems.filter((item) => item.roles.includes(role));
  };

  const getFullNavItems = (role: UserRole): NavItem[] => {
    const allItems: NavItem[] = [
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
      // Admin items
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
      // Teacher items
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
      // Student items
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
      // Quick Wins Features
      {
        name: 'Discussion Forums',
        href: '/discussion-forums',
        icon: MessageCircle,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Advanced Search',
        href: '/search',
        icon: Search,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT],
      },
      {
        name: 'Bulk Operations',
        href: '/bulk-operations',
        icon: ListChecks,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
      },
      {
        name: 'Export/Import',
        href: '/export-import',
        icon: Download,
        roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER],
      },
    ];

    return allItems.filter((item) => item.roles.includes(role));
  };

  const navItems = currentUser ? getNavItems(currentUser.role) : [];
  const fullNavItems = currentUser ? getFullNavItems(currentUser.role) : [];

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href.endsWith('dashboard')) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (variant === 'bottom-tabs') {
    return (
      <>
        {/* Bottom Tab Navigation */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
            "safe-area-inset-bottom",
            className
          )}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              if (item.name === 'Menu') {
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    onClick={handleMenuClick}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-2 px-3 min-h-[60px] touch-manipulation",
                      "hover:bg-accent/50 active:bg-accent/70 transition-colors"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">Menu</span>
                  </Button>
                );
              }

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-3 rounded-lg min-h-[60px] touch-manipulation relative",
                      "transition-colors duration-200",
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>

        {/* Full Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {fullNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link key={item.name} href={item.href}>
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-lg border touch-manipulation relative",
                              "transition-colors duration-200",
                              active
                                ? "text-primary bg-primary/10 border-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border-border"
                            )}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-sm font-medium text-center">{item.name}</span>
                            {item.badge && (
                              <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Hamburger menu variant (alternative implementation)
  return (
    <div className={cn("md:hidden", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMenuClick}
        className="h-9 w-9 p-0"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r border-border overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {fullNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg touch-manipulation relative",
                            "transition-colors duration-200",
                            active
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}