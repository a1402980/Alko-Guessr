import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { getTopScores } from "@/actions/db";

export default async function LeaderboardPage() {
  const scores = await getTopScores();
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-col justify-center items-center">
        <div className="flex-1 container py-8 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
          <LeaderboardTable scores={scores} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
