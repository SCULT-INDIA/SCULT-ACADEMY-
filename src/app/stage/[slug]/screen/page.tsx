import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireTeam } from "@/lib/server/auth";
import { getDeck } from "@/lib/server/decks";
import { toClientDeck } from "@/lib/stage/client-deck";
import { AudienceScreen } from "@/components/stage/audience";

export const metadata = { title: "Audience screen" };

export default function AudienceScreenPage({ params }: PageProps<"/stage/[slug]/screen">) {
  return (
    <Suspense fallback={<div className="h-dvh bg-black" />}>
      <Screen params={params} />
    </Suspense>
  );
}

async function Screen({ params }: { params: PageProps<"/stage/[slug]/screen">["params"] }) {
  const { slug } = await params;
  await requireTeam(`/stage/${slug}/screen`);
  const deck = await getDeck(slug);
  if (!deck) notFound();
  return <AudienceScreen deck={toClientDeck(deck)} />;
}
