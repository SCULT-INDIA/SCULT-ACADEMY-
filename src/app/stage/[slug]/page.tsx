import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireTeam } from "@/lib/server/auth";
import { getDeck } from "@/lib/server/decks";
import { toClientDeck } from "@/lib/stage/client-deck";
import { Presenter } from "@/components/stage/presenter";

export default function PresentDeckPage({ params }: PageProps<"/stage/[slug]">) {
  return (
    <Suspense fallback={<div className="grid h-dvh place-items-center text-cream-mute">Loading deck…</div>}>
      <DeckPresenter params={params} />
    </Suspense>
  );
}

async function DeckPresenter({ params }: { params: PageProps<"/stage/[slug]">["params"] }) {
  const { slug } = await params;
  await requireTeam(`/stage/${slug}`);
  const deck = await getDeck(slug);
  if (!deck) notFound();
  return <Presenter deck={toClientDeck(deck)} screenHref={`/stage/${slug}/screen`} backHref="/stage" />;
}
