import { memo, useState } from "react";
import { useLoaderData, useNavigation, useSubmit } from "react-router";
import type { LoaderData } from "~/interface";
import type { Vocabulary } from "~/types/vocabulary";

type SearchResultsProps = {
  searchResults: Vocabulary[];
};

function SearchResults({ searchResults }: SearchResultsProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleRecordClick = async (vocabId: string) => {
    setSubmittingId(vocabId);
    await submit({ relatedId: vocabId }, { method: "POST" });
  };

  const { similarWords } = useLoaderData<LoaderData>();
  const similarWordIds = similarWords.map((word) => word.related.id);

  if (searchResults.length === 0) return null;

  return (
    <div className="bg-gray-100 rounded">
      {searchResults.map((vocab, index) => (
        <div
          key={vocab.id}
          onClick={() => handleRecordClick(vocab.id)}
          className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-200 ${
            index > 0 ? "border-t border-gray-200" : ""
          }`}
        >
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl">{vocab.word}</strong>
              {vocab.phonetic && (
                <span className="text-gray-600">{vocab.phonetic}</span>
              )}
            </div>
            {vocab.definition && <p className="mt-2">{vocab.definition}</p>}
          </div>
          <div className="m-4">
            {navigation.state === "submitting" && submittingId === vocab.id ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-x-gray-200 border-y-gray-300"></div>
            ) : (
              similarWordIds.includes(vocab.id) && (
                <div className="w-3 h-6 border-r-2 border-b-2 border-blue-500 rotate-45"></div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(SearchResults);
