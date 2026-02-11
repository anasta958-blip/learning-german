
import React, { useState } from 'react';
import { Word } from '../types';

interface ReadingViewProps {
  text: string;
  words: Word[];
  onComplete: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ text, words, onComplete }) => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  const renderText = () => {
    let elements: React.ReactNode[] = [];
    const parts = text.split(/(\s+|,|\.|—|!|\?)/);

    parts.forEach((part, index) => {
      const normalized = part.toLowerCase();
      const matchingWord = words.find(w => 
        w.german.toLowerCase().split(' ').pop() === normalized || 
        w.german.toLowerCase() === normalized
      );

      if (matchingWord) {
        elements.push(
          <span 
            key={index} 
            onClick={() => setSelectedWord(matchingWord)}
            className={`inline-block px-1 rounded cursor-pointer transition-colors font-bold ${
              selectedWord?.id === matchingWord.id 
              ? 'bg-indigo-600 text-white' 
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {part}
          </span>
        );
      } else {
        elements.push(part);
      }
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Чтение текста</h2>
      
      <div className="flex-1 overflow-y-auto text-lg leading-relaxed text-slate-700 font-medium pb-40">
        {renderText()}
      </div>

      {/* Persistent Hint Panel at the bottom of the reading area */}
      {selectedWord && (
        <div className="absolute bottom-20 left-4 right-4 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl z-20 animate-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setSelectedWord(null)}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <img src={selectedWord.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
            <div>
              <h3 className="text-xl font-bold">{selectedWord.german}</h3>
              <p className="text-indigo-300 font-bold">{selectedWord.russian}</p>
              <div className="flex gap-2 text-xs opacity-60 mt-1">
                <span>{selectedWord.transcription}</span>
                <span>•</span>
                <span>{selectedWord.translit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-slate-100">
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
        >
          Закрепить слова
        </button>
      </div>
    </div>
  );
};

export default ReadingView;
