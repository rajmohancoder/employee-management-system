import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function AddEmployeeLayout({
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
                {/* Header with Search Disabled */}
                <Header showSearch={false} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
