
import React from 'react';
import FacebookIcon from './icons/FacebookIcon';
import TwitterIcon from './icons/TwitterIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import CopyIcon from './icons/CopyIcon';
import GmailIcon from './icons/GmailIcon';
import ThreadsIcon from './icons/ThreadsIcon';
import LinkIcon from './icons/LinkIcon';
import InstagramIcon from './icons/InstagramIcon';
import SnapchatIcon from './icons/SnapchatIcon';

interface BibleSharePopoverProps {
  verses: { num: number; text: string }[];
  book: string;
  chapter: number;
  version: string;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

const BibleSharePopover: React.FC<BibleSharePopoverProps> = ({ verses, book, chapter, version, onClose, position = 'top' }) => {
  // Format the reference string (e.g., John 3:16 or John 3:16-18)
  const formatReference = (): string => {
    if (verses.length === 0) return `${book} ${chapter}`;
    if (verses.length === 1) return `${book} ${chapter}:${verses[0].num}`;
    
    const sortedNums = verses.map(v => v.num).sort((a, b) => a - b);
    return `${book} ${chapter}:${sortedNums[0]}-${sortedNums[sortedNums.length - 1]}`;
  };

  const generateDeepLink = (): string => {
     const params = new URLSearchParams();
     params.set('page', 'bible');
     params.set('book', book);
     params.set('chapter', chapter.toString());
     params.set('version', version);
     if (verses.length > 0) {
         params.set('verses', verses.map(v => v.num).sort((a, b) => a - b).join(','));
     }
     // Use official domain for shared links to ensure consistency
     return `https://trueharvest.world/?${params.toString()}`;
  };

  const reference = formatReference();
  const verseText = verses.map(v => `[${v.num}] ${v.text}`).join('\n');
  const shareLink = generateDeepLink();
  
  // Share text includes the verse, reference, and explicit source domain
  const shareText = `${verseText}\n\n${reference}\nSource: ${shareLink}`;
  
  const encodedShareText = encodeURIComponent(shareText);
  const encodedShareLink = encodeURIComponent(shareLink);

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopyText = (alertUser = true) => {
    navigator.clipboard.writeText(shareText).then(() => {
      if (alertUser) alert('Verse text copied to clipboard!');
      onClose();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy verse.');
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
        alert('Link copied to clipboard!');
        onClose();
    }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link.');
    });
  };

  const handleCopyForApp = (appName: string) => {
      handleCopyText(false);
      alert(`Text copied! You can now paste it into ${appName}.`);
      onClose();
  }

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <FacebookIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedShareLink}&quote=${encodeURIComponent(`${verseText}\n— ${reference}`)}`),
      className: 'text-blue-500 hover:bg-slate-700'
    },
    {
      name: 'X (Twitter)',
      icon: <TwitterIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://twitter.com/intent/tweet?text=${encodedShareText}`),
      className: 'text-white hover:bg-slate-700'
    },
    {
      name: 'WhatsApp',
      icon: <WhatsappIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://api.whatsapp.com/send?text=${encodedShareText}`),
      className: 'text-green-500 hover:bg-slate-700'
    },
     {
      name: 'Threads',
      icon: <ThreadsIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://www.threads.net/share?text=${encodedShareText}`),
      className: 'text-slate-300 hover:bg-slate-700'
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon className="h-6 w-6" />,
      action: () => handleCopyForApp('Instagram'),
      className: 'text-pink-500 hover:bg-slate-700'
    },
    {
      name: 'Snapchat',
      icon: <SnapchatIcon className="h-6 w-6" />,
      action: () => handleCopyForApp('Snapchat'),
      className: 'text-yellow-400 hover:bg-slate-700'
    },
     {
      name: 'Email',
      icon: <GmailIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`mailto:?subject=Verse from True Harvest: ${reference}&body=${encodedShareText}`),
      className: 'text-red-500 hover:bg-slate-700'
    }
  ];

  const positionClasses = position === 'top'
    ? 'bottom-full mb-3'
    : 'top-full mt-3';

  return (
    <div 
        className={`absolute right-0 ${positionClasses} w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-fadeInUp max-h-80 overflow-y-auto custom-scrollbar`}
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
          <div className="border-t border-slate-700 my-1"></div>
          
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 text-amber-400 hover:bg-slate-700"
          >
            <LinkIcon className="h-6 w-6" />
            <span className="font-semibold text-sm">Copy Link</span>
          </button>
          
          <button
            onClick={() => handleCopyText(true)}
            className="w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 text-slate-400 hover:bg-slate-700"
          >
            <CopyIcon className="h-6 w-6" />
            <span className="font-semibold text-sm text-slate-200">Copy Text</span>
          </button>
        </div>
    </div>
  );
};

export default BibleSharePopover;
