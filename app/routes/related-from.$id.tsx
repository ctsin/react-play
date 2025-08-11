import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import prisma from "~/lib/prisma";
import BackButton from "~/components/BackButton";
import VocabularyHeader from "~/components/VocabularyHeader";
import VocabularyCard from "~/components/VocabularyCard";
import type { Vocabulary, VocabularyRelation } from "~/types/vocabulary";

export async function loader({ params }: LoaderFunctionArgs) {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: { id: params.id as string },
  });

  if (!vocabulary) {
    throw new Response("Not Found", { status: 404 });
  }

  // Find all words that have this word as a related word (similarFrom)
  const relatedFromWords = await prisma.vocabularyRelation.findMany({
    where: { relatedId: params.id as string },
    include: {
      vocabulary: {
        select: {
          id: true,
          word: true,
          phonetic: true,
          definition: true,
        },
      },
    },
  });

  return { vocabulary, relatedFromWords };
}

type LoaderData = {
  vocabulary: Vocabulary;
  relatedFromWords: VocabularyRelation[];
};

export default function VocabularyRelatedFrom() {
  const { vocabulary, relatedFromWords } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col gap-10">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center">
        <BackButton />
      </div>

      {/* Header */}
      <VocabularyHeader vocabulary={vocabulary} />

      {/* Related From Words */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Words that consider "{vocabulary.word}" as similar ({relatedFromWords.length})
        </h2>
        {relatedFromWords.length > 0 ? (
          <div className="bg-gray-100 rounded">
            {relatedFromWords.map((relation, index) => (
              <VocabularyCard
                key={relation.id}
                vocabulary={relation.vocabulary}
                to={`/vocabulary/${relation.vocabulary.id}`}
                className={index > 0 ? "border-t border-gray-200" : ""}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No words consider "{vocabulary.word}" as similar.</p>
        )}
      </div>
    </div>
  );
}