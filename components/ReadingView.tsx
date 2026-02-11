
import React, { useState } from 'react';
import { Word } from '../types';

interface ReadingViewProps {
  text: string;
  allWords: Word[];
  currentLessonWords: Word[];
  learnedWordIds: Set<string>;
  onComplete: () => void;
}

const ReadingView: React.FC<ReadingViewProps> = ({ 
  text, 
  allWords, 
  currentLessonWords, 
  learnedWordIds, 
  onComplete 
}) => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  // Helper to match text word against dictionary word
  const findMatchingWord = (token: string) => {
    const normalized = token.toLowerCase().replace(/[.,!?—\s]/g, '');
    if (!normalized) return null;

    return allWords.find(w => {
      const dictGerman = w.german.toLowerCase();
      const dictMain = dictGerman.split(' ').pop() || ''; // Extract "Leben" from "das Leben"

      // 1. Exact matches (with or without article)
      if (normalized === dictGerman || normalized === dictMain) return true;

      // 2. Stem matching (for verbs like "denkt" -> "denken")
      // Very simple rule: if word starts with the stem (dict word minus 'en' or 'n')
      const stem = dictMain.length > 3 ? dictMain.replace(/(en|n)$/, '') : dictMain;
      if (normalized.startsWith(stem) && stem.length > 2) return true;

      // 3. Irregular forms used in texts
      const irregulars: Record<string, string[]> = {
        'lesen': ['liest'],
        'wollen': ['will'],
        'werden': ['werde', 'wird'],
      };
      if (irregulars[dictMain]?.includes(normalized)) return true;

      return false;
    });
  };

  const renderText = () => {
    let elements: React.ReactNode[] = [];
    // Split by spaces and punctuation, but keep punctuation as separate tokens
    const tokens = text.split(/(\s+|,|\.|\!|\?|—)/);

    tokens.forEach((token, index) => {
      const matchingWord = findMatchingWord(token);
      
      // Highlight if it's from current lesson OR already learned
      const isFromCurrentLesson = matchingWord && currentLessonWords.some(cw => cw.id === matchingWord.id);
      const isLearned = matchingWord && learnedWordIds.has(matchingWord.id);

      if (matchingWord && (isFromCurrentLesson || isLearned)) {
        elements.push(
          <span 
            key={index} 
            onClick={() => setSelectedWord(matchingWord)}
            className={`inline-block px-1 rounded cursor-pointer transition-colors font-bold ${
              selectedWord?.id === matchingWord.id 
              ? 'bg-indigo-600 text-white' 
              : isLearned 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {token}
          </span>
        );
      } else {
        elements.push(token);
      }
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Чтение текста</h2>
        <div className="flex gap-2">
           <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase">
             <div className="w-2 h-2 rounded-full bg-indigo-100"></div> Новое
           </div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
             <div className="w-2 h-2 rounded-full bg-emerald-100"></div> Выучено
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto text-lg leading-relaxed text-slate-700 font-medium pb-40">
        {renderText()}
      </div>

      {/* Bottom Info Panel */}
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
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{selectedWord.german}</h3>
                {learnedWordIds.has(selectedWord.id) && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">В словаре</span>
                )}
              </div>
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
