import { Outlet } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EPAM Community Talk" },
    { name: "description", content: "A demonstration for Prisma ORM" },
  ];
}

export default function Layout() {
  return (
    <div className="max-w-4xl flex flex-col mx-auto p-4">
      <Outlet />
    </div>
  );
}
