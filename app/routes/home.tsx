import { Link, useLoaderData } from "react-router";
import prisma from "~/lib/prisma";
import VocabularyCard from "~/components/VocabularyCard";
import type { Vocabulary } from "~/types/vocabulary";

export async function loader() {
  const vocabularies = await prisma.vocabulary.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { vocabularies };
}

type LoaderData = {
  vocabularies: Vocabulary[];
};

export default function Home() {
  const { vocabularies } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Link
          to="create"
          className="bg-blue-500 text-white p-3 rounded text-center flex-1"
        >
          Create
        </Link>
        {/* <Link
          to="test"
          className="bg-gray-500 text-white p-3 rounded text-center flex-1"
        >
          Test Action/Loader
        </Link> */}
      </div>

      <div className="bg-gray-100 rounded">
        {vocabularies.map((vocab, index) => (
          <VocabularyCard
            key={vocab.id}
            vocabulary={vocab}
            to={`/vocabulary/${vocab.id}`}
            className={index > 0 ? "border-t border-gray-200" : ""}
          />
        ))}
      </div>
    </div>
  );
}
