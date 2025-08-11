import { Link } from "react-router";

export default function BackButton() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
    >
      ← Home
    </Link>
  );
}