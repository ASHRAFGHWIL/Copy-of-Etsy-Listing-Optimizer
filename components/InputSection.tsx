
import React from 'react';

interface InputSectionProps {
  productDescription: string;
  setProductDescription: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({
  productDescription,
  setProductDescription,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-secondary-dark p-6 rounded-2xl shadow-lg">
        <label htmlFor="product-description" className="block text-lg font-semibold text-text-light dark:text-text-dark mb-2">
          Product Description
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter a basic description of your product. The more detail you provide, the better the AI-generated listing will be.
        </p>
        <textarea
          id="product-description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="e.g., A handmade leather tote bag with brass fittings, perfect for daily use. It has an internal pocket for a phone..."
          className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-text-light dark:text-text-dark focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent transition"
          disabled={isLoading}
        />
        <button
          onClick={onGenerate}
          disabled={isLoading || !productDescription.trim()}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Create Listing'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
