"use client";

import { Product } from "@/types/product";
import SpinningWheel, { Segments } from "./spinning-wheel";
import { Header } from "./header";
import { Footer } from "./footer";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  products: Product[];
  categories: string[];
};

const SpinnerPage = ({ products: defaultProducts, categories }: Props) => {
  const [pageReady, setPageReady] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setPageReady(true);
  }, []);

  const segments: Segments[] = products.map((product, i) => {
    return {
      segmentText: product.name,
      segColor: i % 2 === 0 ? "#0c1a3c" : "#c11a20",
    };
  });

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="w-full flex flex-col items-center">
        <div className="container py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {pageReady && ( // select has a hydration issue so we do this to prevent server rendering
              <div>
                <h3>Kategoriat</h3>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse kategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <SpinningWheel
                showTextOnSpin={true}
                buttonText="SPIN"
                segments={segments}
                onFinished={(result) => console.log(result)}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SpinnerPage;
