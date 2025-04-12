import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategorySelection } from "@/components/category-selection"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <CategorySelection />
      <Footer />
    </main>
  )
}
