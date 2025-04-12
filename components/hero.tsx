import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Welcome to AlkoGuessr
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Test your knowledge of Alko products! Guess which product is in
              the picture as it becomes clearer over time.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/play">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Play Now
              </Button>
            </Link>
            <Link href="/how-to-play">
              <Button variant="outline" size="lg">
                How to Play
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
