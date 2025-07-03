
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { ActionType, UserRole, type NotificationMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { Bell, LogOut, UserCircle, Settings, LayoutDashboard, BookOpen, Edit3, BarChart2, DollarSign, Users, GraduationCap, AnnoyedIcon, CalendarDays, CalendarCheck, MessageSquare, Video, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNowStrict } from 'date-fns';


export function Navbar() {
  const { state, dispatch, handleLogoutUser: contextHandleLogoutUser } = useAppContext();
  const { currentUser, notifications, directMessages } = state;
  const router = useRouter();

  const handleLogout = async () => {
    await contextHandleLogoutUser();
    router.push('/auth');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = directMessages.filter(dm => dm.recipientId === currentUser?.id && !dm.read).length;

  const handleNotificationClick = (notification: NotificationMessage) => {
    if (!notification.read) {
      dispatch({ type: ActionType.MARK_NOTIFICATION_READ, payload: { id: notification.id } });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIconForNotification = (type: NotificationMessage['type']) => {
    switch(type) {
      case 'success': return <GraduationCap className="w-4 h-4 text-green-500" />;
      case 'error': return <AnnoyedIcon className="w-4 h-4 text-red-500" />;
      case 'info': return <Users className="w-4 h-4 text-blue-500" />;
      case 'warning': return <Bell className="w-4 h-4 text-yellow-500" />;
      case 'new_assignment': return <Edit3 className="w-4 h-4 text-purple-500" />;
      case 'grade_update': return <BarChart2 className="w-4 h-4 text-teal-500" />;
      case 'announcement': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'payment_due': return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'payment_received': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'new_message': return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const navLinks = [
    // Common
    { name: 'Announcements', href: '/announcements', roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { name: 'Calendar', href: '/calendar', roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { name: 'Messages', href: '/messages', roles: [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT], messageCount: unreadMessagesCount },
    // Admin
    { name: 'Dashboard', href: '/admin/dashboard', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Users', href: '/admin/users', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Courses', href: '/admin/courses', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Attendance', href: '/admin/attendance', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Payments', href: '/admin/payments', roles: [UserRole.SUPER_ADMIN] },
    { name: 'Reports', href: '/admin/reports', roles: [UserRole.SUPER_ADMIN] },
    // Teacher
    { name: 'Dashboard', href: '/teacher/dashboard', roles: [UserRole.TEACHER] },
    { name: 'My Courses', href: '/teacher/courses', roles: [UserRole.TEACHER] },
    { name: 'Attendance', href: '/teacher/attendance', roles: [UserRole.TEACHER] },
    { name: 'Reports', href: '/teacher/reports', roles: [UserRole.TEACHER] },
    // Student
    { name: 'Dashboard', href: '/student/dashboard', roles: [UserRole.STUDENT] },
    { name: 'Courses', href: '/student/courses', roles: [UserRole.STUDENT] },
    { name: 'Live Class', href: '/student/live-class', roles: [UserRole.STUDENT], icon: <Video className="mr-1 h-4 w-4" /> },
    { name: 'Attendance', href: '/student/attendance', roles: [UserRole.STUDENT] },
    { name: 'Payments', href: '/student/payments', roles: [UserRole.STUDENT] },
  ];

  const filteredNavLinks = currentUser ? navLinks.filter(link => link.roles.includes(currentUser.role)) : [];

  const renderNavLinks = (isMobile = false) => (
    filteredNavLinks.map((link) => (
      <Button key={link.href + link.name} variant={isMobile ? "ghost" : "link"} asChild className={isMobile ? "justify-start" : "text-sm font-medium text-foreground hover:text-primary transition-colors p-0 h-auto"}>
        <Link href={link.href} className="relative flex items-center">
            {link.icon}{link.name}
            {!!link.messageCount && link.messageCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                {link.messageCount}
              </Badge>
            )}
        </Link>
      </Button>
    ))
  );

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-headline font-bold text-primary">
              {APP_NAME}
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && renderNavLinks()}
          </div>
          <div className="flex items-center space-x-2">
             {currentUser ? (
                <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadNotificationsCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full animate-pulse">
                          {unreadNotificationsCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 md:w-96">
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => dispatch({type: ActionType.MARK_ALL_NOTIFICATIONS_READ})}>Mark all as read</Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                       <DropdownMenuItem disabled className="text-muted-foreground text-center py-2">No new notifications</DropdownMenuItem>
                    ) : (
                    <ScrollArea className="h-[300px]">
                      {notifications.slice(0,10).map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex items-start gap-3 p-2 cursor-pointer ${notif.read ? 'opacity-70' : 'font-semibold bg-accent/10'}`}
                        >
                          <span className="mt-1 shrink-0">{getIconForNotification(notif.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm leading-tight whitespace-normal">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNowStrict(new Date(notif.timestamp))} ago</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                    )}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => dispatch({type: ActionType.CLEAR_ALL_NOTIFICATIONS})} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 justify-center">
                        Clear All Notifications
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                       <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="profile picture"/>
                        <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-medium truncate">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                       <Settings className="mr-2 h-4 w-4" />
                       Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6"/>
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] p-4">
                           <Link href="/" className="text-2xl font-headline font-bold text-primary mb-6 block">
                                {APP_NAME}
                            </Link>
                            <div className="flex flex-col space-y-2">
                               {renderNavLinks(true)}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                </>
            ) : (
              <Button onClick={() => router.push('/auth')}>Login / Sign Up</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
