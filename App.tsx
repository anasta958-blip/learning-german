
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_LESSONS } from './data/lessons';
import { AppState, ViewState, Word, Lesson } from './types';
import Flashcard from './components/Flashcard';
import ReadingView from './components/ReadingView';
import { Book, GraduationCap, DictionaryIcon, Settings, ChevronRight, CheckCircle, Lock, Trophy } from './components/Icons';

const App: React.FC = () => {
  // Persistence
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('deutschlern_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, learnedWordIds: new Set(parsed.learnedWordIds) };
    }
    return {
      currentLessonId: null,
      learnedWordIds: new Set<string>(),
      unlockedLessonCount: 1,
      view: 'LESSONS'
    };
  });

  const allWords = useMemo(() => INITIAL_LESSONS.flatMap(l => l.words), []);

  useEffect(() => {
    const dataToSave = {
      ...state,
      learnedWordIds: Array.from(state.learnedWordIds)
    };
    localStorage.setItem('deutschlern_state', JSON.stringify(dataToSave));
  }, [state]);

  // Lesson State (In-Memory for the session)
  const [learningQueue, setLearningQueue] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const startLesson = (lessonId: number) => {
    const lesson = INITIAL_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    // Shuffle words for initial learning
    const shuffled = [...lesson.words].sort(() => Math.random() - 0.5);
    setLearningQueue(shuffled);
    setCurrentWordIndex(0);
    setState(prev => ({ ...prev, currentLessonId: lessonId, view: 'LEARNING' }));
  };

  const handleRemember = (wordId: string) => {
    if (state.view === 'LEARNING') {
      // Add to dictionary
      setState(prev => {
        const nextIds = new Set(prev.learnedWordIds);
        nextIds.add(wordId);
        return { ...prev, learnedWordIds: nextIds };
      });

      // Remove from current queue
      const nextQueue = learningQueue.filter(w => w.id !== wordId);
      if (nextQueue.length === 0) {
        setState(prev => ({ ...prev, view: 'READING' }));
      } else {
        setLearningQueue(nextQueue);
        setCurrentWordIndex(prev => (prev >= nextQueue.length ? 0 : prev));
      }
    } else if (state.view === 'REINFORCING') {
      // Just remove from queue
      const nextQueue = learningQueue.filter(w => w.id !== wordId);
      if (nextQueue.length === 0) {
        completeLesson();
      } else {
        setLearningQueue(nextQueue);
        setCurrentWordIndex(prev => (prev >= nextQueue.length ? 0 : prev));
      }
    }
  };

  const handleForget = (wordId: string) => {
    // Keep in queue, move to end or shuffle
    const nextQueue = [...learningQueue].sort(() => Math.random() - 0.5);
    setLearningQueue(nextQueue);
    // Force rerender if same index
    setCurrentWordIndex(prev => (prev === 0 ? -1 : 0));
    setTimeout(() => setCurrentWordIndex(0), 10);
  };

  const completeLesson = () => {
    const nextLessonCount = Math.max(state.unlockedLessonCount, (state.currentLessonId || 0) + 1);
    setState(prev => ({ 
      ...prev, 
      view: 'LESSONS', 
      unlockedLessonCount: nextLessonCount,
      currentLessonId: null 
    }));
  };

  const goToReinforce = () => {
    const lesson = INITIAL_LESSONS.find(l => l.id === state.currentLessonId);
    if (!lesson) return;
    const shuffled = [...lesson.words].sort(() => Math.random() - 0.5);
    setLearningQueue(shuffled);
    setCurrentWordIndex(0);
    setState(prev => ({ ...prev, view: 'REINFORCING' }));
  };

  const currentWord = learningQueue[currentWordIndex];

  // Helper Views
  const renderLessons = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Уроки</h1>
          <p className="text-slate-500">Твой путь к немецкому</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-2 border border-slate-100">
           <Trophy className="text-amber-500" />
           <span className="font-bold text-slate-700">{state.learnedWordIds.size}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {INITIAL_LESSONS.map((lesson) => {
          const isLocked = lesson.id > state.unlockedLessonCount;
          const isCompleted = lesson.id < state.unlockedLessonCount;

          return (
            <button
              key={lesson.id}
              disabled={isLocked}
              onClick={() => startLesson(lesson.id)}
              className={`group relative flex items-center p-5 rounded-3xl transition-all text-left border-2
                ${isLocked 
                  ? 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed' 
                  : 'bg-white border-white shadow-sm hover:shadow-md hover:border-indigo-100 active:scale-[0.98]'
                }
              `}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-colors
                ${isLocked ? 'bg-slate-200' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}
              `}>
                {isLocked ? <Lock /> : isCompleted ? <CheckCircle /> : <GraduationCap />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                  {lesson.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {lesson.words.length} новых слов
                </p>
              </div>
              {!isLocked && <ChevronRight className="text-slate-300 group-hover:text-indigo-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDictionary = () => {
    const learnedWords = Array.from(state.learnedWordIds)
      .map(id => allWords.find(w => w.id === id))
      .filter((w): w is Word => !!w);

    return (
      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Словарь</h1>
        {learnedWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <Book className="w-16 h-16 mb-4 opacity-20" />
             <p className="text-center font-medium">Вы еще не выучили ни одного слова.<br/>Начните первый урок!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {learnedWords.map(word => (
              <div key={word.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4">
                <img src={word.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                   <p className="font-bold text-slate-800">{word.german}</p>
                   <p className="text-sm text-slate-500 italic">{word.transcription}</p>
                </div>
                <p className="text-indigo-600 font-medium">{word.russian}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (state.view) {
      case 'LEARNING':
      case 'REINFORCING':
        return (
          <div className="flex-1 flex flex-col p-6 items-center">
            <div className="w-full flex justify-between items-center mb-8">
              <button 
                onClick={() => setState(prev => ({ ...prev, view: 'LESSONS', currentLessonId: null }))}
                className="p-3 bg-white rounded-2xl shadow-sm text-slate-500 active:scale-95"
              >
                ← Выйти
              </button>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {state.view === 'LEARNING' ? 'Изучение' : 'Закрепление'}
                </p>
                <p className="font-bold text-slate-800">
                  Осталось: {learningQueue.length}
                </p>
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>
            
            <div className="w-full flex-1 flex flex-col justify-center">
              {currentWord && (
                <Flashcard 
                  key={currentWord.id}
                  word={currentWord} 
                  isStudyMode={state.view === 'LEARNING'}
                  onRemember={handleRemember} 
                  onForget={handleForget} 
                />
              )}
            </div>
            
            {/* Simple Progress Dots */}
            <div className="flex gap-1 mt-8 mb-4">
               {Array.from({length: Math.min(learningQueue.length, 10)}).map((_, i) => (
                 <div key={i} className="w-2 h-2 rounded-full bg-indigo-200" />
               ))}
               {learningQueue.length > 10 && <span className="text-xs text-slate-400 font-bold">...</span>}
            </div>
          </div>
        );

      case 'READING':
        const lesson = INITIAL_LESSONS.find(l => l.id === state.currentLessonId);
        return (
          <div className="flex-1 p-6">
            {lesson && (
              <ReadingView 
                text={lesson.text} 
                allWords={allWords}
                currentLessonWords={lesson.words}
                learnedWordIds={state.learnedWordIds}
                onComplete={goToReinforce} 
              />
            )}
          </div>
        );

      case 'DICTIONARY':
        return renderDictionary();

      default:
        return renderLessons();
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-slate-50">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderCurrentView()}
      </main>

      {/* Navigation - Hidden during active learning/reading */}
      {(state.view === 'LESSONS' || state.view === 'DICTIONARY') && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <button 
            onClick={() => setState(prev => ({ ...prev, view: 'LESSONS' }))}
            className={`flex flex-col items-center gap-1 transition-colors ${state.view === 'LESSONS' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Book className={state.view === 'LESSONS' ? 'scale-110' : ''} />
            <span className="text-[10px] font-bold uppercase">Уроки</span>
          </button>
          
          <button 
            onClick={() => setState(prev => ({ ...prev, view: 'DICTIONARY' }))}
            className={`flex flex-col items-center gap-1 transition-colors ${state.view === 'DICTIONARY' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <DictionaryIcon className={state.view === 'DICTIONARY' ? 'scale-110' : ''} />
            <span className="text-[10px] font-bold uppercase">Словарь</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-slate-300 cursor-not-allowed">
            <Settings />
            <span className="text-[10px] font-bold uppercase">Настройки</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
