import { useLoaderData, Link, useFetcher, useNavigate } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import _ from "lodash";
import prisma from "~/lib/prisma";
import SearchResults from "~/components/SearchResults";
import DeleteWordButton from "~/components/DeleteWordButton";
import BackButton from "~/components/BackButton";
import VocabularyHeader from "~/components/VocabularyHeader";
import type { Vocabulary, VocabularyRelation } from "~/types/vocabulary";

export async function loader({ params }: LoaderFunctionArgs) {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: { id: params.id as string },
  });

  if (!vocabulary) {
    throw new Response("Not Found", { status: 404 });
  }

  const similarWords = await prisma.vocabularyRelation.findMany({
    where: { vocabularyId: params.id as string },
    include: {
      related: {
        select: {
          id: true,
          word: true,
          phonetic: true,
          definition: true,
        },
      },
    },
  });

  return { vocabulary, similarWords };
}

type LoaderData = {
  vocabulary: Vocabulary;
  similarWords: VocabularyRelation[];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const selectedIds = JSON.parse(formData.get("selectedIds") as string);
  const vocabularyId = params.id as string;

  try {
    for (const relatedId of selectedIds) {
      await prisma.vocabularyRelation.upsert({
        where: {
          vocabularyId_relatedId: {
            vocabularyId,
            relatedId,
          },
        },
        update: {},
        create: {
          vocabularyId,
          relatedId,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Save error:", error);
    return { error: "Failed to save similar words" };
  }
}

export default function VocabularyDetail() {
  const { vocabulary, similarWords: loadedSimilarWords } =
    useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Vocabulary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const isInitialRender = useRef(true);

  // Compute similarWords including selected items and excluding removed items
  const existingRelatedIds = new Set(loadedSimilarWords.map(sw => sw.related.id));
  const similarWords = [
    ...loadedSimilarWords.filter(sw => !removedIds.has(sw.related.id)),
    ...Array.from(selectedIds)
      .filter(id => !existingRelatedIds.has(id))
      .map((id) => {
        const word = searchResults.find((w) => w.id === id);
        return word
          ? {
              id: `temp-${id}`,
              vocabularyId: vocabulary.id,
              relatedId: id,
              related: word,
            }
          : null;
      })
      .filter(Boolean),
  ];

  const debouncedSearch = useCallback(
    _.debounce(async (query: string) => {
      if (query.trim()) {
        try {
          const excludeIds = [
            vocabulary.id,
            ...loadedSimilarWords.map((sw) => sw.related.id),
            ...Array.from(selectedIds),
          ];
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(
              query
            )}&exclude=${excludeIds.join(",")}`
          );
          const results = await response.json();
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    [vocabulary.id, loadedSimilarWords, selectedIds]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchValue("");
    setSearchResults([]);
  };

  const handleRemoveRelation = async (relationId: string) => {
    try {
      await fetch(`/api/remove-relation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationId }),
      });
      // Refresh the page to update similar words
      navigate(0);
    } catch (error) {
      console.error("Error removing relation:", error);
    }
  };

  const handleRecordClick = (
    e: React.MouseEvent,
    vocabId: string,
    isSelected: boolean
  ) => {
    e.preventDefault();
    if (isSelected) {
      // Remove from selected
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(vocabId);
        return newSet;
      });
      // If it exists in loaded similar words, mark it as removed
      if (existingRelatedIds.has(vocabId)) {
        setRemovedIds((prev) => new Set(prev).add(vocabId));
      }
    } else {
      // Add to selected
      setSelectedIds((prev) => new Set(prev).add(vocabId));
      // Remove from removed list if it was there
      setRemovedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(vocabId);
        return newSet;
      });
    }
  };

  // Reset state when vocabulary changes
  useEffect(() => {
    setSearchValue("");
    setSearchResults([]);
    setSelectedIds(new Set());
    setRemovedIds(new Set());
    isInitialRender.current = true;
  }, [vocabulary.id]);

  // Auto-submit selected IDs
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (selectedIds.size > 0) {
      fetcher.submit(
        { selectedIds: JSON.stringify(Array.from(selectedIds)) },
        { method: "post" }
      );
    }
  }, [selectedIds]);

  return (
    <div className="flex flex-col gap-10">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center">
        <BackButton />
        <DeleteWordButton vocabularyId={vocabulary.id} word={vocabulary.word} />
      </div>
      {/* Vocabulary Details */}
      <VocabularyHeader vocabulary={vocabulary} />

      {/* Similar Words Section */}
      {similarWords.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Similar Words</h2>
          <div className="flex flex-wrap gap-2">
            {similarWords.map((relation) => (
              <div
                key={relation?.id}
                className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                <Link
                  to={`/related-from/${relation?.related.id}`}
                  className="px-3 py-1 hover:bg-blue-200 rounded-l-full"
                >
                  {relation?.related.word}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveRelation(relation?.id!);
                  }}
                  className="px-2 py-1 text-blue-600 hover:text-red-600 hover:bg-red-100 rounded-r-full transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <label htmlFor="search-similar" className="text-gray-700 font-medium">
          Search and select similar words to "{vocabulary.word}"
        </label>

        <div className="relative">
          <input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search vocabularies..."
            className="p-2 pr-10 border rounded border-gray-300 w-full"
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕ Clear
            </button>
          )}
        </div>

        <SearchResults
          searchResults={searchResults}
          selectedIds={selectedIds}
          onRecordClick={handleRecordClick}
        />

        {fetcher.state === "submitting" && (
          <div className="mt-4 text-gray-600">Saving...</div>
        )}
      </div>
    </div>
  );
}
