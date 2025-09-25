import React from 'react';
import CopyButton from './CopyButton';
import ResultCard from './ResultCard';

interface GeneratedListProps {
    title: string;
    items: string[];
    charLimit?: number;
    isEditable?: boolean;
    onItemChange?: (index: number, value: string) => void;
}

const GeneratedList: React.FC<GeneratedListProps> = ({ title, items, charLimit, isEditable, onItemChange }) => {
    return (
        <ResultCard title={title}>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-primary-light dark:bg-gray-700 p-2 rounded-lg gap-2">
                        <div className="flex-grow flex items-center">
                            {isEditable && onItemChange ? (
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => onItemChange(index, e.target.value)}
                                    maxLength={charLimit}
                                    className="flex-grow bg-transparent focus:outline-none w-full text-text-light dark:text-text-dark px-1"
                                    aria-label={`Editable item ${index + 1}`}
                                />
                            ) : (
                                <span className="px-1">{item}</span>
                            )}
                            {charLimit && (
                                <span className={`text-sm whitespace-nowrap ${
                                    item.length > charLimit
                                        ? 'text-red-600 dark:text-red-400 font-semibold'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    ({item.length}/{charLimit})
                                </span>
                            )}
                        </div>
                        <CopyButton textToCopy={item} />
                    </li>
                ))}
            </ul>
        </ResultCard>
    );
}

export default GeneratedList;