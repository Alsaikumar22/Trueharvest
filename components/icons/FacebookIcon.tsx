import React from 'react';

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1.5 13.5h-2.5v-6h-2v-2.5h2v-1.12c0-1.63.78-2.88 2.8-2.88H16v2.5h-1.5c-.39 0-.5.2-.5.5v1h2l-.5 2.5h-1.5v6z" />
    </svg>
);

export default FacebookIcon;