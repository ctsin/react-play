import { Link } from "react-router";
import type { Vocabulary } from "~/types/vocabulary";

type VocabularyCardProps = {
  vocabulary: Vocabulary;
  to: string;
  className?: string;
};

export default function VocabularyCard({ vocabulary, to, className = "" }: VocabularyCardProps) {
  return (
    <Link
      to={to}
      className={`block p-4 hover:bg-gray-200 transition-colors ${className}`}
    >
      <div className="flex items-baseline gap-2">
        <strong className="text-2xl">{vocabulary.word}</strong>
        {vocabulary.phonetic && (
          <span className="text-gray-600">{vocabulary.phonetic}</span>
        )}
      </div>
      {vocabulary.definition && <p className="mt-2">{vocabulary.definition}</p>}
    </Link>
  );
}