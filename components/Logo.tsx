
import React from 'react';

interface LogoProps {
  showText?: boolean;
  svgClassName?: string;
  rootClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ showText = true, svgClassName = "w-10 h-10", rootClassName = "" }) => {
  return (
    <div className={`flex items-center group ${rootClassName}`} aria-label="True Harvest - Reap the Word Home">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`text-amber-500 dark:text-amber-400 ${svgClassName} ${showText ? 'mr-3' : ''} transition-transform duration-300 group-hover:scale-110`}
        role="img"
        aria-label="True Harvest Logo: A cross rising from a field of wheat."
      >
        {/* The Cross - Main vertical and horizontal beams */}
        <path 
          d="M12 3V21M7 9H17"
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wheat Stalk Details - Left Side */}
        <path 
          d="M12 18C10 18 8 16 8 14M12 15C10 15 9 13.5 9 12"
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Wheat Stalk Details - Right Side */}
        <path 
          d="M12 18C14 18 16 16 16 14M12 15C14 15 15 13.5 15 12"
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Seed Heads at top of wheat */}
        <circle cx="8" cy="13.5" r="0.5" fill="currentColor" />
        <circle cx="9" cy="11.5" r="0.5" fill="currentColor" />
        <circle cx="16" cy="13.5" r="0.5" fill="currentColor" />
        <circle cx="15" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
      {showText && (
        <div className="hidden sm:block text-left">
          <span className="font-serif text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-none block transition-colors">True Harvest</span>
          <span className="block text-[10px] font-black text-amber-600 dark:text-amber-500/80 tracking-[0.3em] uppercase mt-0.5">Reap the Word</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
