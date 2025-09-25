
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import GeneratedList from './components/GeneratedList';
import { generateListing } from './services/geminiService';
import { ListingData } from './types';
import CheckIcon from './components/icons/CheckIcon';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [productDescription, setProductDescription] = useState('');
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic Title, Description & Keywords for user editing
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [editableKeywords, setEditableKeywords] = useState<string[]>([]);

  // State for save functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setTheme(e.matches ? 'dark' : 'light');
    });
  }, []);
  
  useEffect(() => {
    if (listingData) {
        setEditableTitle(listingData.title);
        setEditableDescription(listingData.description);
        setEditableKeywords(listingData.keywords);
        setHasUnsavedChanges(false);
        setSaveState('idle');
    }
  }, [listingData]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Reset save state from 'saved' to 'idle' after a delay, but only if no new changes have been made.
  useEffect(() => {
    if (saveState === 'saved' && !hasUnsavedChanges) {
        const timer = setTimeout(() => {
            setSaveState('idle');
        }, 2000);
        return () => clearTimeout(timer); // Cleanup on unmount or if dependencies change
    }
  }, [saveState, hasUnsavedChanges]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleGenerateListing = useCallback(async () => {
    if (!productDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setListingData(null);

    try {
      const data = await generateListing(productDescription);
      setListingData(data);
// FIX: Added opening brace for the catch block to fix syntax error.
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [productDescription]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...editableKeywords];
    newKeywords[index] = value;
    setEditableKeywords(newKeywords);
    setHasUnsavedChanges(true);
  };

  const handleSaveListing = () => {
    if (!listingData || !hasUnsavedChanges) return;
    
    setSaveState('saving');

    // Simulate network latency for better UX
    setTimeout(() => {
        setListingData({
            ...listingData,
            title: editableTitle,
            description: editableDescription,
            keywords: editableKeywords,
        });
        setHasUnsavedChanges(false);
        setSaveState('saved');
    }, 500);
  };

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightKeywords = (text: string, keywords: string[], highlightClassName: string): React.ReactNode => {
    if (!keywords || keywords.length === 0 || !text) {
      return text;
    }
    const sortedKeywords = [...keywords].filter(k => k.trim() !== '').sort((a, b) => b.length - a.length);
    if (sortedKeywords.length === 0) {
      return text;
    }

    // Use a regex with Unicode property escapes (\p{L}, \p{N}) and lookarounds 
    // to correctly handle whole-word boundaries for international characters (like Arabic).
    // The 'u' flag is necessary for this to work.
    const regex = new RegExp(`(?<![\\p{L}\\p{N}_])(${sortedKeywords.map(escapeRegex).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
    
    const parts = text.split(regex);

    // When splitting with a capturing group, the matched keywords are at odd indices.
    return parts.map((part, index) => {
      if (part && index % 2 === 1) { // It's a keyword
        return <span key={index} className={highlightClassName}>{part}</span>;
      }
      return part; // It's the text between keywords
    });
  };

  // Helper to centralize all logic for the save button's appearance and state
  const getSaveButtonProps = () => {
    const baseClasses = "px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2";

    if (hasUnsavedChanges) {
      return {
        disabled: false,
        className: `${baseClasses} bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-1`,
        children: 'حفظ الإعلان'
      };
    }
    
    switch (saveState) {
        case 'saving':
            return {
                disabled: true,
                className: `${baseClasses} bg-purple-400 cursor-wait`,
                children: (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الحفظ...
                    </>
                )
            };
        case 'saved':
            return {
                disabled: true,
                className: `${baseClasses} bg-green-600 cursor-default`,
                children: (
                    <>
                        <CheckIcon className="w-5 h-5"/>
                        تم الحفظ!
                    </>
                )
            };
        case 'idle':
        default:
            return {
                disabled: true,
                className: `${baseClasses} bg-gray-400 cursor-not-allowed`,
                children: 'حفظ الإعلان'
            };
    }
  };
  
  const saveButtonProps = getSaveButtonProps();

  const commonTextAreaStyles = "w-full bg-transparent focus:outline-none resize-none overflow-hidden p-0 border-0 font-inherit";
  
  const keywordsInTitle = editableKeywords.filter(kw => {
    if (!kw.trim()) return false;
    // Use the same Unicode-aware regex to accurately test if the keyword is in the title.
    const regex = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(kw)}(?![\\p{L}\\p{N}_])`, 'iu');
    return regex.test(editableTitle);
  });

  const getKeywordVolumeClass = (index: number): string => {
    // Top 4 keywords are high volume
    if (index <= 3) {
      return 'bg-green-500';
    }
    // Next 5 keywords are medium volume
    if (index <= 8) {
      return 'bg-yellow-400';
    }
    // Remaining keywords are low volume
    return 'bg-orange-500';
  };

  return (
    <div className={`min-h-screen font-sans bg-primary-light dark:bg-primary-dark transition-colors duration-300`}>
      <div className="container mx-auto max-w-7xl">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="py-8">
          <InputSection
            productDescription={productDescription}
            setProductDescription={setProductDescription}
            onGenerate={handleGenerateListing}
            isLoading={isLoading}
          />

          {error && (
            <div className="text-center mt-8 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-xl max-w-3xl mx-auto">
              <p className="font-semibold">عفوًا! حدث خطأ ما.</p>
              <p>{error}</p>
            </div>
          )}

          {listingData && (
            <div className="mt-8">
              <div className="px-4 mb-6 flex justify-end">
                  <button
                    onClick={handleSaveListing}
                    disabled={saveButtonProps.disabled}
                    className={saveButtonProps.className}
                  >
                    {saveButtonProps.children}
                  </button>
              </div>
              <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                  <ResultCard
                    title="العنوان المُنشأ"
                    textToCopy={editableTitle}
                    badge={
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${editableTitle.length > 140 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-secondary-light dark:bg-gray-700 text-text-light dark:text-text-dark'}`}>
                        {editableTitle.length} / 140
                      </span>
                    }
                  >
                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className={`${commonTextAreaStyles} text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words pointer-events-none`}
                        >
                            {highlightKeywords(editableTitle, keywordsInTitle, "rounded bg-purple-200/60 dark:bg-purple-800/60")}
                            {editableTitle === '' && '\u00A0' /* Non-breaking space to maintain height */}
                        </div>
                        <textarea
                            value={editableTitle}
                            onChange={handleFieldChange(setEditableTitle)}
                            className={`${commonTextAreaStyles} absolute top-0 left-0 w-full h-full text-lg text-transparent caret-purple-500 dark:caret-purple-300`}
                            rows={1}
                            aria-label="Editable product title"
                        />
                    </div>
                  </ResultCard>
                  <ResultCard
                    title="الوصف المُنشأ"
                    textToCopy={editableDescription}
                    badge={
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${editableDescription.length > 500 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-secondary-light dark:bg-gray-700 text-text-light dark:text-text-dark'}`}>
                        {editableDescription.length} / 500
                      </span>
                    }
                  >
                      <div className="relative">
                        <div
                              aria-hidden="true"
                              className={`${commonTextAreaStyles} text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words pointer-events-none`}
                          >
                              {highlightKeywords(editableDescription, editableKeywords, "rounded bg-teal-100 dark:bg-teal-900/60")}
                              {editableDescription === '' && '\u00A0' /* Non-breaking space */}
                          </div>
                          <textarea
                              value={editableDescription}
                              onChange={handleFieldChange(setEditableDescription)}
                              className={`${commonTextAreaStyles} absolute top-0 left-0 w-full h-full text-base text-transparent caret-teal-500 dark:caret-teal-300 leading-relaxed`}
                              rows={1}
                              aria-label="Editable product description"
                          />
                      </div>
                  </ResultCard>
                  <ResultCard title="الفئة المقترحة" textToCopy={listingData.category}>
                      <p className="font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full inline-block">
                          {listingData.category}
                      </p>
                  </ResultCard>
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <GeneratedList 
                      title="الكلمات المفتاحية (SEO)" 
                      items={editableKeywords} 
                      charLimit={20}
                      isEditable={true}
                      onItemChange={handleKeywordChange}
                      showVolumeLegend={true}
                      getItemIndicatorClass={getKeywordVolumeClass}
                    />
                  <GeneratedList title="المواد المقترحة" items={listingData.materials} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
