import { getAllCategories, getProductsByCategory } from "@/actions/db";
import SpinnerPage from "@/components/spinner-page";

const Page = async () => {
  const products = await getProductsByCategory();
  const categories = await getAllCategories();
  return <SpinnerPage products={products} categories={categories} />;
};

export default Page;
