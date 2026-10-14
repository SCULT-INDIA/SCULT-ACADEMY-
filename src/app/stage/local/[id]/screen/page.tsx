import { Suspense } from "react";
import { LocalAudience } from "@/components/stage/local-deck";

export const metadata = { title: "Audience screen" };

export default function LocalScreenPage({ params }: PageProps<"/stage/local/[id]/screen">) {
  return (
    <Suspense fallback={<div className="h-dvh bg-black" />}>
      <LocalScreen params={params} />
    </Suspense>
  );
}

async function LocalScreen({ params }: { params: PageProps<"/stage/local/[id]/screen">["params"] }) {
  const { id } = await params;
  return <LocalAudience id={id} />;
}
