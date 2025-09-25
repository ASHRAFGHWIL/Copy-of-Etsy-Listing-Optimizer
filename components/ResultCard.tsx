import React from 'react';
import CopyButton from './CopyButton';

interface ResultCardProps {
  title: string;
  textToCopy?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, textToCopy, badge, children }) => {
  return (
    <div className="bg-white dark:bg-secondary-dark p-6 rounded-2xl shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">{title}</h3>
            {badge}
        </div>
        {textToCopy && <CopyButton textToCopy={textToCopy} />}
      </div>
      <div className="text-gray-700 dark:text-gray-300 space-y-2 text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;