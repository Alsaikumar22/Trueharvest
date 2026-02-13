
import React from 'react';

const TextSizeIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16l4-4 4 4m-4-4v10" />
    </svg>
);

export default TextSizeIcon;
