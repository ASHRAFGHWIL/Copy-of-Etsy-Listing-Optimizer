
import React from 'react';
import CopyButton from './CopyButton';
import ResultCard from './ResultCard';

interface GeneratedListProps {
    title: string;
    items: string[];
    charLimit?: number;
}

const GeneratedList: React.FC<GeneratedListProps> = ({ title, items, charLimit }) => {
    return (
        <ResultCard title={title}>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-primary-light dark:bg-gray-700 p-3 rounded-lg">
                        <span className="flex-grow pr-4">
                            {item}
                            {charLimit && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                    ({item.length}/{charLimit})
                                </span>
                            )}
                        </span>
                        <CopyButton textToCopy={item} />
                    </li>
                ))}
            </ul>
        </ResultCard>
    );
}

export default GeneratedList;
