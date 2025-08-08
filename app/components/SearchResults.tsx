type Vocabulary = {
  id: string;
  word: string;
  phonetic: string | null;
  definition: string | null;
};

type SearchResultsProps = {
  searchResults: Vocabulary[];
  selectedIds: Set<string>;
  onRecordClick: (e: React.MouseEvent, vocabId: string, isSelected: boolean) => void;
};

export default function SearchResults({ searchResults, selectedIds, onRecordClick }: SearchResultsProps) {
  if (searchResults.length === 0) return null;

  return (
    <div className="bg-gray-100 rounded">
      {searchResults.map((vocab, index) => (
        <div
          key={vocab.id}
          onClick={(e) => onRecordClick(e, vocab.id, selectedIds.has(vocab.id))}
          className={`p-4 cursor-pointer transition-colors ${
            selectedIds.has(vocab.id)
              ? "bg-blue-100"
              : "hover:bg-gray-200"
          } ${index > 0 ? "border-t border-gray-200" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl">{vocab.word}</strong>
                {vocab.phonetic && (
                  <span className="text-gray-600">{vocab.phonetic}</span>
                )}
              </div>
              {vocab.definition && (
                <p className="mt-2">{vocab.definition}</p>
              )}
            </div>
            <div className="ml-4">
              <input
                type="checkbox"
                checked={selectedIds.has(vocab.id)}
                onChange={() => {}}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}