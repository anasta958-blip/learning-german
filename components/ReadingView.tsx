
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
    // Normalize input token: lowercase, trim punctuation but keep internal spaces
    const normalized = token.toLowerCase().trim().replace(/[.,!?—]/g, '');
    if (!normalized) return null;

    return allWords.find(w => {
      // Clean up dictionary word (remove plural markers like ", -en")
      const dictGermanFull = w.german.toLowerCase().split(',')[0].trim();
      const dictMainPart = dictGermanFull.split(' ').pop() || ''; // e.g., "Leben" from "das Leben"

      // 1. Exact matches (e.g., "das Leben" == "das leben" or "Leben" == "leben")
      if (normalized === dictGermanFull || normalized === dictMainPart) return true;

      // 2. Stem matching (for verbs like "denkt" -> "denken")
      const stem = dictMainPart.length > 3 ? dictMainPart.replace(/(en|n)$/, '') : dictMainPart;
      if (normalized.startsWith(stem) && stem.length > 2) return true;

      // 3. Irregular forms used in texts
      const irregulars: Record<string, string[]> = {
        'lesen': ['liest'],
        'wollen': ['will'],
        'werden': ['werде', 'wird'],
      };
      if (irregulars[dictMainPart]?.includes(normalized)) return true;

      return false;
    });
  };

  const renderText = () => {
    const elements: React.ReactNode[] = [];
    // Split by punctuation and spaces, keeping them as separate tokens
    const tokens = text.split(/(\s+|,|\.|\!|\?|—)/);
    
    // Tracking pointer to skip tokens that were part of a multi-token match
    let skipUntil = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (i <= skipUntil) continue;
      
      const token = tokens[i];
      if (token.match(/^\s+$/) || token.match(/^[.,!?—]$/)) {
        elements.push(token);
        continue;
      }

      let match: Word | null = null;
      let matchText = '';

      // 1. Пытаемся найти фразу с артиклем (например, "das" + " " + "Leben")
      // Проверяем текущий токен, следующий (пробел) и токен после него
      if (i + 2 < tokens.length && tokens[i+1].match(/^\s+$/)) {
        const potentialPhrase = tokens[i] + tokens[i+1] + tokens[i+2];
        const m = findMatchingWord(potentialPhrase);
        
        // Если нашли совпадение в словаре и оно либо из этого урока, либо уже выучено
        if (m && (currentLessonWords.some(cw => cw.id === m.id) || learnedWordIds.has(m.id))) {
          // Проверяем, что в самом словаре это слово записано с артиклем (содержит пробел)
          const dictEntry = m.german.toLowerCase().split(',')[0].trim();
          if (dictEntry.includes(' ')) {
            match = m;
            matchText = potentialPhrase;
            skipUntil = i + 2;
          }
        }
      }

      // 2. Если фраза не найдена, ищем одиночное слово
      if (!match) {
        const m = findMatchingWord(token);
        if (m && (currentLessonWords.some(cw => cw.id === m.id) || learnedWordIds.has(m.id))) {
          match = m;
          matchText = token;
        }
      }

      if (match) {
        const isLearned = learnedWordIds.has(match.id);
        elements.push(
          <span 
            key={i} 
            onClick={() => setSelectedWord(match)}
            className={`inline-block px-1 rounded cursor-pointer transition-colors font-bold ${
              selectedWord?.id === match.id 
              ? 'bg-indigo-600 text-white' 
              : isLearned 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {matchText}
          </span>
        );
      } else {
        elements.push(token);
      }
    }

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
