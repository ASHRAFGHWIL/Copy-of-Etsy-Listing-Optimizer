
import React from 'react';
import CopyButton from './CopyButton';
import ResultCard from './ResultCard';

interface GeneratedListProps {
    title: string;
    items: string[];
    charLimit?: number;
    isEditable?: boolean;
    onItemChange?: (index: number, value: string) => void;
    showVolumeLegend?: boolean;
    getItemIndicatorClass?: (index: number) => string;
}

const GeneratedList: React.FC<GeneratedListProps> = ({ title, items, charLimit, isEditable, onItemChange, showVolumeLegend, getItemIndicatorClass }) => {
    return (
        <ResultCard title={title}>
            {showVolumeLegend && (
                <div className="flex flex-wrap justify-around items-center mb-4 text-xs text-gray-600 dark:text-gray-400 gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>حجم بحث مرتفع</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span>حجم بحث متوسط</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span>حجم بحث منخفض</span>
                    </div>
                </div>
            )}
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-primary-light dark:bg-gray-700 p-2 rounded-lg gap-2">
                        <div className="flex-grow flex items-center gap-2">
                            {getItemIndicatorClass && (
                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${getItemIndicatorClass(index)}`} aria-hidden="true"></span>
                            )}
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
