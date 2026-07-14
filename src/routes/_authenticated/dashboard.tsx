import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMyProfile } from "@/lib/quest.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const { roles } = await getMyProfile();
    if (roles.includes("profesor")) throw redirect({ to: "/profesor" });
    throw redirect({ to: "/alumno" });
  },
  component: () => null,
});
