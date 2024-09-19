// question.interface.ts
export enum QuestionType {
  English = 'English',
  Arabic = 'Arabic',
  History = 'History'
}

export interface Question {
  id: number;
  description: string;
  author: string;
  date: Date;
  relatedFiles: File[];
  votes: number;
  userName: string;
  userImage: string;
  type: QuestionType; // Add type field to specify the question category
}
export interface PageEvent {
  first?: number|undefined;
  rows?: number|undefined;
  page?: number|undefined;
  pageCount?: number|undefined;
}
export interface City {
  name: string;
  code: string;
}