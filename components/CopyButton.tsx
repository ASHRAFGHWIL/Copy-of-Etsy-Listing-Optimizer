
import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // You could add a user-facing error state here
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-dark ${
        isCopied
          ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 focus:ring-green-500'
          : 'bg-secondary-light dark:bg-secondary-dark text-text-light dark:text-text-dark hover:bg-accent-light dark:hover:bg-accent-dark/50 focus:ring-accent-light'
      }`}
      aria-label="Copy to clipboard"
    >
      {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};

export default CopyButton;
