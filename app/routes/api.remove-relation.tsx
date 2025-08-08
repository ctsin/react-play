import type { ActionFunctionArgs } from "react-router";
import prisma from "~/lib/prisma";

export async function action({ request }: ActionFunctionArgs) {
  const { relationId } = await request.json();

  try {
    await prisma.vocabularyRelation.delete({
      where: { id: relationId }
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing relation:", error);
    return { error: "Failed to remove relation" };
  }
}