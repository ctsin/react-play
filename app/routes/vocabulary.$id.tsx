import {
  useLoaderData,
  Link,
  useFetcher,
  useNavigate,
  useSubmit,
} from "react-router";
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

  const similarWords = await prisma.vocabularyRelation.findMany({
    where: {
      vocabularyId: params.id as string,
    },
    include: {
      related: {
        select: {
          id: true,
        },
      },
    },
  });

  const similarWordIds = similarWords.map(
    (similarWord) => similarWord.relatedId
  );

  const isExisted = similarWordIds.includes(
    formData.get("relatedId") as string
  );

  const relatedId = formData.get("relatedId") as string;
  const vocabularyId = params.id as string;

  if (isExisted) {
    try {
      await prisma.vocabularyRelation.delete({
        where: {
          vocabularyId_relatedId: {
            vocabularyId,
            relatedId,
          },
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return { error: "Failed to delete similar words" };
    }
  } else {
    try {
      await prisma.vocabularyRelation.create({
        data: {
          vocabularyId,
          relatedId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Save error:", error);
      return { error: "Failed to save similar words" };
    }
  }
}

export default function VocabularyDetail() {
  const { vocabulary, similarWords } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Vocabulary[]>([]);

  const debouncedSearch = useCallback(
    _.debounce(async (query: string) => {
      if (query.trim()) {
        try {
          const excludeIds = [
            vocabulary.id,
            ...similarWords.map((sw) => sw.related.id),
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
    [vocabulary.id, similarWords]
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

  const handleRecordClick = (vocabId: string) => {
    submit({ relatedId: vocabId }, { method: "POST" });
  };

  // Reset state when vocabulary changes
  useEffect(() => {
    setSearchValue("");
    setSearchResults([]);
  }, [vocabulary.id]);

  // Reload data after successful submission
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      navigate(0);
    }
  }, [fetcher.state, fetcher.data, navigate]);

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
          selectedIds={new Set()}
          onRecordClick={handleRecordClick}
        />

        {fetcher.state === "submitting" && (
          <div className="mt-4 text-gray-600">Saving...</div>
        )}
      </div>
    </div>
  );
}
