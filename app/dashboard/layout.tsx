import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon, SearchIcon, BellIcon, MoonIcon, ChevronDownIcon, User, Settings, LogOut } from 'lucide-react';



export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex h-screen sticky top-0" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full transition-colors duration-300">

                    <div className="flex items-center gap-4">
                        {/* Mobile Sidebar Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="md:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
                                    <MenuIcon className="w-6 h-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-r dark:border-zinc-800 w-64">
                                <Sidebar className="flex h-full w-full border-none" />
                            </SheetContent>
                        </Sheet>

                        {/* Search */}
                        <div className="relative w-full max-w-sm hidden md:block">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search here"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-200 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="relative group cursor-pointer focus:outline-none">
                                    <BellIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                {/* ... content (Shadcn components handle dark mode usually, but we check if manual styles needed) ... */}
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">New Leave Request</p>
                                        <p className="text-xs text-gray-500">John Doe requested annual leave.</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">Meeting Reminder</p>
                                        <p className="text-xs text-gray-500">Team sync in 15 minutes.</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">System Update</p>
                                        <p className="text-xs text-gray-500">Scheduled maintenance tonight.</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ModeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer group focus:outline-none">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden shrink-0 border-2 border-transparent group-hover:border-teal-500 transition-all">
                                        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Masum Khan</p>
                                        <ChevronDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 inline ml-1" />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

