import type { Vocabulary } from "~/types/vocabulary";

type VocabularyHeaderProps = {
  vocabulary: Vocabulary;
};

export default function VocabularyHeader({ vocabulary }: VocabularyHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <h1 className="text-4xl font-bold">{vocabulary.word}</h1>
        {vocabulary.phonetic && (
          <span className="text-xl text-gray-600">{vocabulary.phonetic}</span>
        )}
      </div>
      {vocabulary.definition && (
        <p className="text-lg">{vocabulary.definition}</p>
      )}
    </div>
  );
}