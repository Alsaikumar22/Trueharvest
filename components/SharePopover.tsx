
import React from 'react';
import FacebookIcon from './icons/FacebookIcon';
import TwitterIcon from './icons/TwitterIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import CopyIcon from './icons/CopyIcon';

interface SharePopoverProps {
  verseText: string;
  reference: string;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

const SharePopover: React.FC<SharePopoverProps> = ({ verseText, reference, onClose, position = 'top' }) => {
  const appUrl = "https://trueharvest.world"; 
  const shareText = `"${verseText}" - ${reference}\nSource: ${appUrl}`;
  
  const encodedShareText = encodeURIComponent(shareText);
  const encodedAppUrl = encodeURIComponent(appUrl);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <FacebookIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedAppUrl}&quote=${encodedShareText}`),
      className: 'text-blue-500 hover:bg-slate-800'
    },
    {
      name: 'X (Twitter)',
      icon: <TwitterIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://twitter.com/intent/tweet?text=${encodedShareText}`),
      className: 'text-white hover:bg-slate-800'
    },
    {
      name: 'WhatsApp',
      icon: <WhatsappIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://api.whatsapp.com/send?text=${encodedShareText}`),
      className: 'text-green-500 hover:bg-slate-800'
    }
  ];

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Verse copied to clipboard!');
      onClose();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy verse.');
    });
  };

  const positionClasses = position === 'top'
    ? 'bottom-full mb-3'
    : 'top-full mt-3';

  return (
    <div 
        className={`absolute right-0 ${positionClasses} w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-fadeInUp`}
        onClick={(e) => e.stopPropagation()}
    >
        <div className="space-y-1">
          {shareOptions.map(option => (
            <button
              key={option.name}
              onClick={option.action}
              className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${option.className}`}
            >
              {option.icon}
              <span className="font-semibold text-sm text-slate-200">{option.name}</span>
            </button>
          ))}
          <button
            onClick={handleCopy}
            className="w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 text-slate-400 hover:bg-slate-800"
          >
            <CopyIcon className="h-6 w-6" />
            <span className="font-semibold text-sm text-slate-200">Copy</span>
          </button>
        </div>
    </div>
  );
};

export default SharePopover;
