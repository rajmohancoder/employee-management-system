import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                        <span className="text-6xl">🚧</span>
                    </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    Oops!
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    This feature is coming soon
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                    We&apos;re working hard to bring you this functionality. 
                    Stay tuned for updates!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-zinc-800 text-white rounded-lg hover:bg-black dark:hover:bg-zinc-700 transition-colors font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    
                    <Link
                        href="/add-employee"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Add Employee
                    </Link>
                </div>
            </div>
        </div>
    );
}