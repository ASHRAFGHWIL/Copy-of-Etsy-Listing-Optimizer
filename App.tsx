import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
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


  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

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


  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto'; // Reset height to recalculate based on content
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    adjustTextareaHeight(titleTextareaRef.current);
    adjustTextareaHeight(descriptionTextareaRef.current);
  }, [listingData, editableTitle, editableDescription]);

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

  const highlightKeywords = (text: string, keywords: string[]): React.ReactNode => {
    if (!keywords || keywords.length === 0) {
      return text;
    }
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const escapeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    const regex = new RegExp(`(${sortedKeywords.map(escapeRegex).join('|')})`, 'gi');
    const parts = text.split(regex);
    const lowercasedKeywords = new Set(keywords.map(kw => kw.toLowerCase()));
    return parts.filter(part => part).map((part, index) => {
      if (lowercasedKeywords.has(part.toLowerCase())) {
        return (
          <span key={index} className="font-bold text-red-500 dark:text-red-400">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Helper to centralize all logic for the save button's appearance and state
  const getSaveButtonProps = () => {
    const baseClasses = "px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2";

    if (hasUnsavedChanges) {
      return {
        disabled: false,
        className: `${baseClasses} bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-1`,
        children: 'Save Listing'
      };
    }
    
    switch (saveState) {
        case 'saving':
            return {
                disabled: true,
                className: `${baseClasses} bg-purple-400 cursor-wait`,
                children: (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
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
                        Saved!
                    </>
                )
            };
        case 'idle':
        default:
            return {
                disabled: true,
                className: `${baseClasses} bg-gray-400 cursor-not-allowed`,
                children: 'Save Listing'
            };
    }
  };
  
  const saveButtonProps = getSaveButtonProps();

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
              <p className="font-semibold">Oops! Something went wrong.</p>
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
                    title="Generated Title"
                    textToCopy={editableTitle}
                    badge={
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${editableTitle.length > 140 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-secondary-light dark:bg-gray-700 text-text-light dark:text-text-dark'}`}>
                        {editableTitle.length} / 140
                      </span>
                    }
                  >
                    <textarea
                      ref={titleTextareaRef}
                      value={editableTitle}
                      onChange={handleFieldChange(setEditableTitle)}
                      className="w-full text-lg bg-transparent focus:outline-none resize-none overflow-hidden p-0 border-0 text-gray-700 dark:text-gray-300"
                      rows={1}
                      aria-label="Editable product title"
                    />
                  </ResultCard>
                  <ResultCard
                    title="Generated Description"
                    textToCopy={editableDescription}
                    badge={
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${editableDescription.length > 500 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-secondary-light dark:bg-gray-700 text-text-light dark:text-text-dark'}`}>
                        {editableDescription.length} / 500
                      </span>
                    }
                  >
                      <textarea
                          ref={descriptionTextareaRef}
                          value={editableDescription}
                          onChange={handleFieldChange(setEditableDescription)}
                          className="w-full text-base bg-transparent focus:outline-none resize-none overflow-hidden p-0 border-0 text-gray-700 dark:text-gray-300 leading-relaxed"
                          rows={1}
                          aria-label="Editable product description"
                      />
                  </ResultCard>
                  <ResultCard title="Suggested Category" textToCopy={listingData.category}>
                      <p className="font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full inline-block">
                          {listingData.category}
                      </p>
                  </ResultCard>
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <GeneratedList 
                      title="SEO Keywords" 
                      items={editableKeywords} 
                      charLimit={20}
                      isEditable={true}
                      onItemChange={handleKeywordChange}
                    />
                  <GeneratedList title="Suggested Materials" items={listingData.materials} />
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
