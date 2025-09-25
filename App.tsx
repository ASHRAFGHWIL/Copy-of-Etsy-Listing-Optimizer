import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import GeneratedList from './components/GeneratedList';
import { generateListing } from './services/geminiService';
import { ListingData } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [productDescription, setProductDescription] = useState('');
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic Title & Description for user editing
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

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
    }
  }, [listingData]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const highlightKeywords = (text: string, keywords: string[]): React.ReactNode => {
    if (!keywords || keywords.length === 0) {
      return text;
    }
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      keywords.some(kw => new RegExp(`^${kw}$`, 'i').test(part)) ? (
        <span key={index} className="font-bold text-red-500 dark:text-red-400">
          {part}
        </span>
      ) : (
        part
      )
    );
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
              <p className="font-semibold">Oops! Something went wrong.</p>
              <p>{error}</p>
            </div>
          )}

          {listingData && (
            <div className="mt-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                  <p className="text-lg">
                    {highlightKeywords(editableTitle, listingData.keywords)}
                  </p>
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
                    <p>
                        {highlightKeywords(editableDescription, listingData.keywords)}
                    </p>
                </ResultCard>
                 <ResultCard title="Suggested Category" textToCopy={listingData.category}>
                    <p className="font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full inline-block">
                        {listingData.category}
                    </p>
                </ResultCard>
              </div>
              <div className="lg:col-span-1 space-y-8">
                 <GeneratedList title="SEO Keywords" items={listingData.keywords} charLimit={20} />
                 <GeneratedList title="Suggested Materials" items={listingData.materials} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;