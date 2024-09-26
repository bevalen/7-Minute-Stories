'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'; // Importing Popover component
import { Menu } from 'lucide-react'; // Import User and Menu icons
import { Separator } from '@/components/ui/separator';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <header className="flex justify-between items-center py-4 px-8 border-b">
            <h1 className="text-2xl font-bold">
                <Link href="/">7-Minute Story</Link>
            </h1>
            <div className="flex items-center space-x-4">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger>
                        <div onClick={handleToggle} className="flex px-4 py-2 items-center space-x-2 rounded-full hover:shadow-md transition-shadow duration-200 border border-gray-300 border-solid">
                            <Menu size={20} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent align="end" side="bottom" className="mt-2">
                        <div className="flex flex-col" onClick={handleClose}>
                            <Link href="/testimony" className="p-2 hover:underline">Write Your 7-Minute Story</Link>
                            <Separator className="my-2" /> 
                            <div className="p-2 text-sm font-semibold text-gray-500">Built by Ben Valentin</div>
                            <Link href="mailto:ben@benvalentin.me" className="py-1 px-2 text-sm text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Email</Link>
                            <Link href="https://resume.benvalentin.me" className="py-1 px-2 text-sm text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Resume</Link>
                            <Link href="https://benvalentin.me" className="py-1 px-2 text-sm text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Consulting</Link>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
};

export default Header;