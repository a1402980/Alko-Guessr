import {
  getAllBottleSizes,
  getAllCategories,
  getProductsByCategory,
} from "@/actions/db";
import SpinnerPage from "@/components/spinner-page";
import { Metadata } from "next";

const Page = async () => {
  const products = await getProductsByCategory();
  const categories = await getAllCategories();
  const bottleSizes = await getAllBottleSizes();
  return (
    <SpinnerPage
      products={products}
      categories={categories}
      bottleSizes={bottleSizes}
    />
  );
};

export default Page;

export const metadata: Metadata = {
  title: "AlkoGuessr - Spin the Alko Product",
  description: "Spin the spinner and get a random Alko product!",
};
