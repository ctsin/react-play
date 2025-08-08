import type { LoaderFunctionArgs } from "react-router";
import prisma from "~/lib/prisma";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exclude = url.searchParams.get("exclude");

  if (!query) {
    return [];
  }

  const excludeIds = exclude ? exclude.split(',') : [];

  const results = await prisma.vocabulary.findMany({
    where: {
      word: {
        contains: query,
        mode: 'insensitive'
      },
      id: {
        notIn: excludeIds
      }
    },
    orderBy: { word: 'asc' }
  });

  return results;
}