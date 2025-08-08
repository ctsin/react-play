import { Link, useLoaderData } from "react-router";
import prisma from "~/lib/prisma";

export async function loader() {
  const vocabularies = await prisma.vocabulary.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { vocabularies };
}

export default function Home() {
  const { vocabularies } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="create"
        className="bg-blue-500 text-white p-3 rounded text-center"
      >
        Create
      </Link>

      <div className="bg-gray-100 rounded">
        {vocabularies.map((vocab, index) => (
          <Link
            key={vocab.id}
            to={`/vocabulary/${vocab.id}`}
            className={`block p-4 hover:bg-gray-200 transition-colors ${index > 0 ? "border-t border-gray-200" : ""}`}
          >
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl">{vocab.word}</strong>
              {vocab.phonetic && (
                <span className="text-gray-600">{vocab.phonetic}</span>
              )}
            </div>
            {vocab.definition && <p className="mt-2">{vocab.definition}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
