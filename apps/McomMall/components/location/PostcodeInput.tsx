import React, { useState, useEffect } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';

export function PostcodeInput({ onSelect }: { onSelect: (postcode: string) => void }) {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    const timeout = setTimeout(() => {
      // Mock suggestions
      const mockSugs = [
        input.toUpperCase() + ' 1AA',
        input.toUpperCase() + ' 2BB',
      ];
      if (input.toUpperCase().replace(/\s+/g, '').startsWith('SE15')) {
        mockSugs.unshift('SE15 5EW (Peckham)');
      } else if (input.toUpperCase().replace(/\s+/g, '').startsWith('SW9')) {
        mockSugs.unshift('SW9 8JD (Brixton)');
      }
      setSuggestions(mockSugs);
      setIsSearching(false);
    }, 400);
    
    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your business postcode"
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 animate-spin text-gray-400 w-5 h-5" />
        )}
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => {
                const cleanPostcode = sug.split(' ')[0] + ' ' + (sug.split(' ')[1] || '');
                setInput(cleanPostcode);
                setSuggestions([]);
                onSelect(cleanPostcode);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 border-gray-100 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-800 font-medium">{sug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
