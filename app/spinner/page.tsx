import {
  getAllBottleSizes,
  getAllCategories,
  getProductsByCategory,
} from "@/actions/db";
import SpinnerPage from "@/components/spinner-page";

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
