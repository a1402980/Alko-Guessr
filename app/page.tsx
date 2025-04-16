import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CategorySelection } from "@/components/category-selection";
import { Footer } from "@/components/footer";
import { getAllCategories } from "@/actions/db";

export default async function Home() {
  const categories = await getAllCategories();
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <Hero />
      <CategorySelection categories={categories} />
      <Footer />
    </main>
  );
}
