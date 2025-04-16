import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormattedType } from "@/types/product";

type Props = {
  categories: FormattedType[];
};

export function CategorySelection({ categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
          Select a Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.slug} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{category.name_en}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Test your knowledge of {category.name_en.toLocaleLowerCase()}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/play?category=${category.slug}`}
                  className="w-full"
                >
                  <Button className="w-full">Play</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
