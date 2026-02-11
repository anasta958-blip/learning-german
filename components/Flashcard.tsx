
import React, { useState, useEffect } from 'react';
import { Word } from '../types';

interface FlashcardProps {
  word: Word;
  isStudyMode?: boolean;
  onRemember: (id: string) => void;
  onForget: (id: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, isStudyMode, onRemember, onForget }) => {
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when word changes
  useEffect(() => {
    setFlipped(false);
  }, [word]);

  const handleFlip = () => {
    if (!isStudyMode) {
      setFlipped(!flipped);
    }
  };

  if (isStudyMode) {
    // Single-sided card for Study Mode
    return (
      <div className="w-full max-w-sm mx-auto h-[520px] bg-white rounded-3xl shadow-xl p-6 flex flex-col border-2 border-slate-100">
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-6">
          <img src={word.imageUrl} alt={word.german} className="w-full h-full object-cover" />
        </div>
        
        <div className="text-center flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-slate-800">{word.german}</h2>
          <div className="flex flex-col items-center gap-1 mt-1">
            <p className="text-slate-500 italic">{word.transcription}</p>
            <p className="text-slate-400 text-sm">{word.translit}</p>
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Перевод</h3>
            <p className="text-indigo-600 font-bold text-2xl">{word.russian}</p>
          </div>
        </div>

        <div className="flex w-full gap-4 mt-8">
          <button 
            onClick={() => onForget(word.id)}
            className="flex-1 py-4 bg-white border-2 border-rose-500 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition-colors shadow-sm active:scale-95"
          >
            Не запомнил
          </button>
          <button 
            onClick={() => onRemember(word.id)}
            className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-sm active:scale-95"
          >
            Запомнил!
          </button>
        </div>
      </div>
    );
  }

  // Flippable card for Reinforcement Mode
  return (
    <div className="w-full max-w-sm mx-auto h-[500px] perspective-1000">
      <div 
        className={`relative w-full h-full duration-500 card-inner ${flipped ? 'card-flip' : ''}`}
        onClick={handleFlip}
      >
        {/* Front Face (German only) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between card-face border-2 border-slate-100 cursor-pointer">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
            <img src={word.imageUrl} alt={word.german} className="w-full h-full object-cover" />
          </div>
          
          <div className="text-center flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-slate-800">{word.german}</h2>
            <p className="text-slate-500 italic mt-2">{word.transcription}</p>
            <p className="text-slate-400 text-sm mt-1">{word.translit}</p>
          </div>
          
          <p className="text-indigo-600 font-medium text-sm">
            Нажмите, чтобы увидеть перевод
          </p>
        </div>

        {/* Back Face (Full Info + Action Buttons) */}
        <div className="absolute inset-0 w-full h-full bg-indigo-50 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between card-face card-back border-2 border-indigo-200 cursor-pointer">
          <div className="text-center flex-1 flex flex-col justify-center items-center">
             <h3 className="text-slate-500 text-sm uppercase tracking-widest mb-2">Перевод</h3>
             <h2 className="text-4xl font-bold text-indigo-900">{word.russian}</h2>
             <div className="mt-8 text-center space-y-1">
                <p className="text-2xl font-semibold text-slate-800">{word.german}</p>
                <p className="text-slate-500 italic">{word.transcription}</p>
             </div>
          </div>
          <div className="flex w-full gap-4 mt-8" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => { setFlipped(false); onForget(word.id); }}
              className="flex-1 py-4 bg-white border-2 border-rose-500 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition-colors shadow-sm active:scale-95"
            >
              Не запомнил
            </button>
            <button 
              onClick={() => { setFlipped(false); onRemember(word.id); }}
              className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors shadow-sm active:scale-95"
            >
              Запомнил!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
