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
      className={`block p-4 hover:bg-gray-200 transition-colors text-xl ${className}`}
    >
      {vocabulary.word}
    </Link>
  );
}