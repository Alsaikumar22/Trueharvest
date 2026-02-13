
import React from 'react';
import type { Song } from '../types';
import FacebookIcon from './icons/FacebookIcon';
import TwitterIcon from './icons/TwitterIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import InstagramIcon from './icons/InstagramIcon';
import SnapchatIcon from './icons/SnapchatIcon';
import CopyIcon from './icons/CopyIcon';

interface SongSharePopoverProps {
  song: Song;
  onClose: () => void;
}

const SongSharePopover: React.FC<SongSharePopoverProps> = ({ song, onClose }) => {
  const appDomain = "https://trueharvest.world";
  // Generate a robust ID for deep linking
  const songId = song.id || `${song.title}-${song.artist}`.replace(/[/\\?%*:|"<>]/g, "-");
  const deepLink = `${appDomain}/?page=song&id=${encodeURIComponent(songId)}`;
  
  // Construct the share message including title, artist, app link, and optional external link
  let shareText = `Check out this song: "${song.title}" by ${song.artist}.\n\nListen on True Harvest:\n${deepLink}`;
  
  if (song.youtubeUrl && song.youtubeUrl !== 'undefined') {
      shareText += `\n\nWatch Video: ${song.youtubeUrl}`;
  }

  const encodedShareText = encodeURIComponent(shareText);
  const encodedDeepLink = encodeURIComponent(deepLink);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <FacebookIcon className="h-6 w-6" />,
      action: () => handleSocialShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedDeepLink}&quote=${encodedShareText}`),
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
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon className="h-6 w-6" />,
      action: handleCopyAndAlert,
      className: 'text-pink-500 hover:bg-slate-800'
    },
    {
      name: 'Snapchat',
      icon: <SnapchatIcon className="h-6 w-6" />,
      action: handleCopyAndAlert,
      className: 'text-yellow-400 hover:bg-slate-800'
    }
  ];

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };
  
  const handleCopy = (alertUser: boolean = true) => {
    navigator.clipboard.writeText(shareText).then(() => {
      if (alertUser) alert('Song info copied to clipboard!');
      onClose();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy song info.');
    });
  };

  function handleCopyAndAlert() {
    handleCopy(false);
    alert("Song info copied! You can now paste it in your story or message.");
    onClose();
  }


  return (
    <div 
        className="absolute right-0 bottom-full mb-3 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
    >
        <div className="space-y-1">
          {shareOptions.map(option => (
            <button
              key={option.name}
              onClick={option.action}
              className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${option.className}`}
              title={option.name === 'Instagram' || option.name === 'Snapchat' ? "Copy to clipboard" : `Share on ${option.name}`}
            >
              {option.icon}
              <span className="font-semibold text-sm text-slate-200">{option.name}</span>
            </button>
          ))}
          <div className="h-px bg-slate-700 my-1"></div>
          <button
            onClick={() => handleCopy(true)}
            className="w-full flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 text-slate-400 hover:bg-slate-800"
          >
            <CopyIcon className="h-6 w-6" />
            <span className="font-semibold text-sm text-slate-200">Copy Info</span>
          </button>
        </div>
    </div>
  );
};

export default SongSharePopover;
