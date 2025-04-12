import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HowToPlayPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">How to Play AlkoGuessr</h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Game Rules</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong>Select a Category:</strong> Choose from different product categories like Red Wines, White
                  Wines, Beers, Spirits, and more.
                </li>
                <li>
                  <strong>Guess the Product:</strong> You'll be shown a blurry image of an Alko product, which will
                  gradually become clearer over time.
                </li>
                <li>
                  <strong>Choose an Answer:</strong> Select from four possible options. The faster you answer correctly,
                  the more points you earn.
                </li>
                <li>
                  <strong>Complete All Rounds:</strong> Each game consists of 10 rounds. Try to get the highest score
                  possible!
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Scoring</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each correct answer earns you 1 point</li>
                <li>The game tracks your total score out of 10 possible points</li>
                <li>Your scores are saved to the leaderboard if you're logged in</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Tips</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay attention to the shape of the bottle or packaging</li>
                <li>Look for distinctive colors or label designs</li>
                <li>If you're familiar with Alko products, try to recall the visual characteristics</li>
                <li>Don't wait too long - the image will become completely clear eventually!</li>
              </ul>
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/play">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Playing Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
