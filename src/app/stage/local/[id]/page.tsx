import { Suspense } from "react";
import { LocalPresenter } from "@/components/stage/local-deck";

export const metadata = { title: "Local PDF" };

export default function LocalDeckPage({ params }: PageProps<"/stage/local/[id]">) {
  return (
    <Suspense fallback={<div className="h-dvh" />}>
      <LocalDeck params={params} />
    </Suspense>
  );
}

async function LocalDeck({ params }: { params: PageProps<"/stage/local/[id]">["params"] }) {
  const { id } = await params;
  return <LocalPresenter id={id} />;
}
