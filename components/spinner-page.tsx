"use client";

import { FormattedType, Product } from "@/types/product";
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
import { useIsMobile } from "./ui/use-mobile";
import { Input } from "./ui/input";
import { getProducts } from "@/actions/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { playEffect } from "@/lib/effects";

type Props = {
  products: Product[];
  categories: FormattedType[];
  bottleSizes: string[];
};

const SpinnerPage = ({
  products: defaultProducts,
  categories,
  bottleSizes,
}: Props) => {
  const [pageReady, setPageReady] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedBottleSize, setSelectedBottleSize] = useState<
    string | undefined
  >(undefined);

  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const isMobile = useIsMobile();
  const wheelSize = isMobile ? 150 : 290;
  const enoughProducts = products.length > 1;

  useEffect(() => {
    setPageReady(true);
  }, []);

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const min = parseFloat(priceMin) || undefined;
    const max = parseFloat(priceMax) || undefined;

    const newProducats = await getProducts({
      category: selectedCategory,
      priceMax: max,
      priceMin: min,
      bottleSize: selectedBottleSize,
    });

    setProducts(newProducats);
  };

  const handleSpinFinish = (result: string) => {
    const product = products.find((p) => p.name === result);
    if (product) {
      setSelectedProduct(product);
      setModalOpen(true);
      playEffect("fanfare");
    }
  };

  const segments: Segments[] = products.map((product, i) => {
    return {
      segmentText: product.name,
      segColor: i % 2 === 0 ? "#0c1a3c" : "#c11a20",
    };
  });

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="container py-8 px-4 md:px-6">
          <div className="flex flex-col items-center gap-4  mb-6">
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Bottle spinner
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center">
              Having trouble choosing what to buy?
              <br />
              Choose your filters and spin the wheel to see what you get!
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-12">
            {pageReady && ( // select has a hydration issue so we do this to prevent server rendering
              <form
                onSubmit={handleFilterSubmit}
                className="flex flex-col gap-4"
              >
                {/* Filter form */}
                <div>
                  <h3>Category</h3>
                  <Select
                    value={selectedCategory || "none"} // Default to "none" if no category is selected
                    onValueChange={(value) =>
                      setSelectedCategory(value === "none" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="none">
                        None
                      </SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.name}>
                          {c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3>Bottle size</h3>
                  <Select
                    value={selectedBottleSize || "none"} // Default to "none" if no bottle size is selected
                    onValueChange={(value) =>
                      setSelectedBottleSize(
                        value === "none" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bottle size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="none">
                        None
                      </SelectItem>
                      {bottleSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3>Price range</h3>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Min €"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max €"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit">Filter</Button>
              </form>
            )}

            <div>
              {enoughProducts && (
                <SpinningWheel
                  showTextOnSpin={true}
                  buttonText="SPIN"
                  segments={segments}
                  onFinished={handleSpinFinish}
                  size={wheelSize}
                />
              )}
              {!enoughProducts && (
                <p>
                  Not enough products with these criteria ({products.length}{" "}
                  items)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for showing the selected product */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-white">
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-auto rounded object-contain p-2"
                />
              </div>

              <p>{selectedProduct.description}</p>
              <p>{selectedProduct.price} €</p>
              <a
                href={`https://www.alko.fi/tuotteet/${selectedProduct.product_id}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={"outline"}>
                  Buy product <ExternalLink />
                </Button>
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default SpinnerPage;
