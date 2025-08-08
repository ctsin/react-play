import { useFetcher } from "react-router";

type DeleteWordButtonProps = {
  vocabularyId: string;
  word: string;
};

export default function DeleteWordButton({ vocabularyId, word }: DeleteWordButtonProps) {
  const fetcher = useFetcher();

  const handleDelete = () => {
    fetcher.submit(
      { vocabularyId },
      { method: "delete", action: "/api/delete-word" }
    );
  };

  return (
    <button
      onClick={handleDelete}
      disabled={fetcher.state === "submitting"}
      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
    >
      {fetcher.state === "submitting" ? "Deleting..." : "Delete"}
    </button>
  );
}