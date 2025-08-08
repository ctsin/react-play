import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import prisma from "~/lib/prisma";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const vocabularyId = formData.get("vocabularyId") as string;

  try {
    // Delete all relations first
    await prisma.vocabularyRelation.deleteMany({
      where: {
        OR: [
          { vocabularyId },
          { relatedId: vocabularyId }
        ]
      }
    });

    // Delete the vocabulary
    await prisma.vocabulary.delete({
      where: { id: vocabularyId }
    });

    return redirect("/");
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    return { error: "Failed to delete vocabulary" };
  }
}