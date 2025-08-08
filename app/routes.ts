import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("create", "routes/create.tsx"),
    route("vocabulary/:id", "routes/vocabulary.$id.tsx"),
    route("api/search", "routes/api.search.tsx"),
    route("api/remove-relation", "routes/api.remove-relation.tsx"),
    route("api/delete-word", "routes/api.delete-word.tsx"),
  ]),
] satisfies RouteConfig;
