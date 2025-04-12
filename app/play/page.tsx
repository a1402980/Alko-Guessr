import { GameContainer } from "@/components/game-container";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default async function PlayPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const category = searchParams.category;

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <GameContainer category={category} />
      <Footer />
    </main>
  );
}
