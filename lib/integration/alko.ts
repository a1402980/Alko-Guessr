import {
  formattedTypesSchema,
  integrationProductSchema,
} from "@/schemas/product";
import { FormattedType, IntegrationProduct } from "@/types/product";
import { capitalize, compact, uniqBy } from "lodash";
import slugify from "slugify";

export function productFromAlkoData(data: any): IntegrationProduct {
  const productId = data["Numero"];
  const mappedData = {
    product_id: productId,
    name: data["Nimi"],
    manufacturer: data["Valmistaja"] || null,
    bottle_size: data["Pullokoko"] || null,
    price: Number.parseFloat(data["Hinta"]),
    price_per_liter: Number.parseFloat(data["Litrahinta"]) || null,
    is_new: (data["Uutuus"] || "") === "uutuus",
    price_order_code: data["Hinnastojärjestyskoodi"] || null,
    type: capitalize(data["Tyyppi"]) || null,
    sub_type: data["Alatyyppi"] || null,
    special_group: data["Erityisryhmä"] || null,
    country: data["Valmistusmaa"] || null,
    region: data["Alue"] || null,
    vintage: data["Vuosikerta"] || null,
    label_notes: data["Etikettimerkintöjä"] || null,
    notes: data["Huomautus"] || null,
    grapes: data["Rypäleet"] || null,
    description: data["Luonnehdinta"] || null,
    packaging_type: data["Pakkaustyyppi"] || null,
    closure_type: data["Suljentatyyppi"] || null,
    alcohol_percentage: Number.parseFloat(data["Alkoholi-%"]) || null,
    acidity: Number.parseFloat(data["Hapot g/l"]) || null,
    sugar: Number.parseFloat(data["Sokeri g/l"]) || null,
    energy: Number.parseFloat(data["Energia kcal/100 ml"]) || null,
    selection: data["Valikoima"] || null,
    ean: data["EAN"] || null,
    image_url: productId
      ? `https://images.alko.fi/images/cs_srgb,f_auto,t_medium/cdn/${productId}/.jpg`
      : null,
  };
  return integrationProductSchema.parse(mappedData);
}

export const typesFromProducts = (
  products: IntegrationProduct[]
): FormattedType[] => {
  const uniqueTypes = compact(uniqBy(products, "type").map((p) => p.type));

  const translationMap: Record<string, string> = {
    Viinijuomat: "Wine Drinks",
    Alkoholittomat: "Non-Alcoholic",
    "Brandyt, armanjakit ja calvadosit": "Brandies, Armagnacs, And Calvados",
    "Ginit ja maustetut viinat": "Gins And Flavored Spirits",
    Hanapakkaukset: "Bag-In-Box Packages",
    Juomasekoitukset: "Cocktails",
    "Jälkiruokaviinit, väkevöidyt ja muut viinit":
      "Dessert Wines, Fortified And Other Wines",
    Konjakit: "Cognacs",
    "Kuohuviinit ja samppanjat": "Sparkling Wines And Champagnes",
    "Lahja- ja juomatarvikkeet": "Gifts And Drink Accessories",
    "Liköörit ja katkerot": "Liqueurs And Bitters",
    Oluet: "Beers",
    Punaviinit: "Red Wines",
    Rommit: "Rums",
    Roseeviinit: "Rosé Wines",
    Siiderit: "Ciders",
    Valkoviinit: "White Wines",
    Viskit: "Whiskies",
    "Vodkat ja viinat": "Vodkas And Spirits",
  };

  const formattedData = uniqueTypes.map((t) => {
    return {
      slug: slugify(t, {
        replacement: "-",
        lower: true,
        strict: true,
        trim: true,
      }),
      name: t,
      name_en: translationMap[t] || t,
    };
  });

  return formattedTypesSchema.parse(formattedData);
};
