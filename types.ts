
export interface Word {
  id: string;
  german: string;
  russian: string;
  transcription: string;
  translit: string;
  imageUrl: string;
}

export interface Lesson {
  id: number;
  title: string;
  words: Word[];
  text: string;
}

export type ViewState = 'LESSONS' | 'LEARNING' | 'READING' | 'REINFORCING' | 'DICTIONARY';

export interface AppState {
  currentLessonId: number | null;
  learnedWordIds: Set<string>;
  unlockedLessonCount: number;
  view: ViewState;
}
