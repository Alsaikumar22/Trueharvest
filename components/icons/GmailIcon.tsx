import React from 'react';

const GmailIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 5.88V18c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-.55.22-1.05.59-1.41L12 12l9.41-7.41c.37.36.59.86.59 1.41zM12 10.5L3.38 4h17.24L12 10.5z" fill="#EA4335"/>
        <path d="M2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5.88l-10 7.5L2 6z" fill="#C5221F"/>
        <path d="M21.41 4.59L12 12 2.59 4.59A1.99 1.99 0 014 4h16c.55 0 1.05.22 1.41.59z" fill="#4285F4"/>
        <path d="M3.38 4L12 10.5 20.62 4H3.38z" fill="#3C79E6"/>
    </svg>
);

export default GmailIcon;
