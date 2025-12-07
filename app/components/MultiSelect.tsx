"use client";

import React, { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export default function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="relative flex-1 min-w-[150px]" ref={containerRef}>
            <button
                type="button"
                className="appearance-none w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-0 focus:border-gray-500 transition-all shadow-sm hover:border-gray-300 cursor-pointer text-left flex items-center justify-between min-h-[38px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate">
                    {selected.length > 0 ? selected.join(', ') : label}
                </span>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1">
                    {options.map((option) => (
                        <div
                            key={option}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                            onClick={() => toggleOption(option)}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                readOnly
                                className="w-4 h-4 mr-3 border-gray-300 rounded text-black focus:ring-black"
                            />
                            <span className={`text-sm ${selected.includes(option) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                {option}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
}
