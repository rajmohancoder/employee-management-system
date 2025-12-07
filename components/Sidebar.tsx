"use client";

import React from 'react';
import {
    ChevronDownIcon,
    LayoutGridIcon,
    VideoIcon,
    MessageCircleIcon,
    FolderIcon,
    TicketIcon,
    UserIcon,
    CalendarIcon,
    FileTextIcon,
    BriefcaseIcon,
    UsersIcon,
    UserCircleIcon,
    SettingsIcon,
    UserPlus,
    Users
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from 'next/link';

interface SubMenuItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    items?: SubMenuItem[];
    isCollapsible?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
    { label: "Overview", icon: <LayoutGridIcon className="w-5 h-5" />, href: "/dashboard" },
    { label: "Meeting", icon: <VideoIcon className="w-5 h-5" />, href: "/dashboard/meeting" },
    { label: "Message", icon: <MessageCircleIcon className="w-5 h-5" />, href: "/dashboard/message" },
    { label: "Project", icon: <FolderIcon className="w-5 h-5" />, href: "/dashboard/project" },
    { label: "Ticket", icon: <TicketIcon className="w-5 h-5" />, href: "/dashboard/ticket" },
    {
        label: "Employee",
        icon: <UserIcon className="w-5 h-5" />,
        isCollapsible: true,
        items: [
            { label: "All Employees", href: "/dashboard/employees", icon: <Users className="w-4 h-4" /> },
            { label: "Add Employee", href: "/dashboard/employees/new", icon: <UserPlus className="w-4 h-4" /> }
        ]
    },
    {
        label: "Attendance",
        icon: <CalendarIcon className="w-5 h-5" />,
        isCollapsible: true,
        items: [
            { label: "Daily Attendance", href: "/dashboard/attendance" },
            { label: "Attendance Report", href: "/dashboard/attendance/report" }
        ]
    },
    { label: "Notice", icon: <FileTextIcon className="w-5 h-5" />, href: "/dashboard/notice" },
    {
        label: "HR Tab",
        icon: <BriefcaseIcon className="w-5 h-5" />,
        isCollapsible: true,
        items: [
            { label: "Payroll", href: "/dashboard/hr/payroll" },
            { label: "Leaves", href: "/dashboard/hr/leaves" }
        ]
    },
    { label: "Organization", icon: <UsersIcon className="w-5 h-5" />, href: "/dashboard/organization" },
    { label: "Account", icon: <UserCircleIcon className="w-5 h-5" />, href: "/dashboard/account" },
    { label: "Setting", icon: <SettingsIcon className="w-5 h-5" />, href: "/dashboard/settings" },
];

import { usePathname } from 'next/navigation';

// ... (existing imports)

// ... imports

export function Sidebar({ className = "" }: { className?: string }) {
    const pathname = usePathname();
    const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <aside className={`w-64 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex-col ${className}`}>
            <div className="p-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="text-teal-500 text-3xl">F</span> Floopyinn
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {MENU_ITEMS.map((item, index) => (
                    <SidebarItem key={index} item={item} pathname={pathname} />
                ))}
            </nav>
        </aside>
    );
}

function SidebarItem({ item, pathname }: { item: MenuItem, pathname: string }) {
    const isActive = pathname === item.href || (item.items?.some(sub => pathname === sub.href) ?? false);
    const [isOpen, setIsOpen] = React.useState(isActive);

    if (item.isCollapsible && item.items) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group ${isOpen ? 'bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900'
                        }`}>
                        <div className="flex items-center gap-3">
                            <span className={`transition-colors ${isOpen || isActive ? 'text-teal-600 dark:text-teal-400' : 'group-hover:text-teal-600 dark:group-hover:text-teal-400'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4 pl-4 border-l border-gray-100 dark:border-zinc-800 space-y-1 mt-1">
                        {item.items.map((subItem, subIndex) => (
                            <Link
                                key={subIndex}
                                href={subItem.href}
                                className="flex items-center gap-3 p-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                            >
                                {subItem.icon && <span>{subItem.icon}</span>}
                                <span>{subItem.label}</span>
                            </Link>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link href={item.href || '#'} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group ${isActive ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900'
            }`}>
            <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? 'text-white dark:text-black' : 'group-hover:text-teal-600 dark:group-hover:text-teal-400'}`}>
                    {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
            </div>
        </Link>
    );
}
