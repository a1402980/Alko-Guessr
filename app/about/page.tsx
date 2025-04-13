import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About AlkoGuessr</h1>

          <div className="space-y-6">
            <p>
              AlkoGuessr is a fun game that tests your knowledge of products
              available at Alko, the Finnish alcoholic beverage retailer. The
              game shows you a blurry image of a product, which gradually
              becomes clearer over time. Your challenge is to identify the
              correct product from four options before the image is fully
              revealed.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How to Play</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Select a product category you want to be tested on</li>
              <li>You'll be shown a blurry image of a product</li>
              <li>The image will gradually become clearer over time</li>
              <li>Choose from four possible options</li>
              <li>The faster you guess correctly, the more points you earn</li>
              <li>Complete all rounds to see your final score</li>
            </ol>

            <h2 className="text-2xl font-bold mt-8 mb-4">About the Data</h2>
            <p>
              AlkoGuessr uses product data from Alko's public price list, which
              is updated regularly. The game includes a wide range of products
              across different categories, including wines, beers, spirits, and
              more.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer</h2>
            <p>
              AlkoGuessr is a fan project and is not affiliated with or endorsed
              by Alko. All product information is sourced from publicly
              available data. This game is intended for entertainment and
              educational purposes only.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Responsible Drinking
            </h2>
            <p>
              AlkoGuessr promotes responsible drinking. Please enjoy alcoholic
              beverages responsibly and be aware of the legal drinking age in
              your country.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
