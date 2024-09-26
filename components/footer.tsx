import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="p-4 text-center">
            <hr className="my-4" />
            <p className="text-sm mb-2">© 2024 Ben Valentin. All rights reserved.</p>
            <div className="text-sm">
                <p className="font-semibold text-gray-500 mb-1">Built by Ben Valentin</p>
                <div className="space-x-4">
                    <Link href="mailto:ben@benvalentin.me" className="text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Email</Link>
                    <Link href="https://resume.benvalentin.me" className="text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Resume</Link>
                    <Link href="https://benvalentin.me" className="text-gray-500 hover:underline" target="_blank" rel="noopener noreferrer">Consulting</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;