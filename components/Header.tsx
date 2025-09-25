
import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="flex justify-between items-center p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">
        Etsy Listing Optimizer ✨
      </h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-text-light dark:text-text-dark bg-secondary-light dark:bg-secondary-dark hover:bg-accent-light dark:hover:bg-accent-dark/50 transition-colors duration-200"
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>
    </header>
  );
};

export default Header;
