export type Vocabulary = {
  id: string;
  word: string;
  phonetic: string | null;
  definition: string | null;
};

export type VocabularyRelation = {
  id: string;
  vocabularyId: string;
  relatedId: string;
  related: Vocabulary;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};