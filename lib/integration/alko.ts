import {
  formattedTypesSchema,
  integrationProductSchema,
} from "@/schemas/product";
import { FormattedType, IntegrationProduct } from "@/types/product";
import { capitalize, uniqBy } from "lodash";
import slugify from "slugify";

export function productFromAlkoData(data: any): IntegrationProduct {
  const mappedData = {
    product_id: String(data["Numero"] || ""),
    name: String(data["Nimi"] || ""),
    manufacturer: String(data["Valmistaja"] || ""),
    bottle_size: String(data["Pullokoko"] || ""),
    price: Number.parseFloat(data["Hinta"] || "0"),
    price_per_liter: Number.parseFloat(data["Litrahinta"] || "0"),
    is_new: (data["Uutuus"] || "") === "uutuus",
    price_order_code: String(data["Hinnastojärjestyskoodi"] || ""),
    type: capitalize(String(data["Tyyppi"] || "")),
    sub_type: String(data["Alatyyppi"] || ""),
    special_group: String(data["Erityisryhmä"] || ""),
    country: String(data["Valmistusmaa"] || ""),
    region: String(data["Alue"] || ""),
    vintage: String(data["Vuosikerta"] || ""),
    label_notes: String(data["Etikettimerkintöjä"] || ""),
    notes: String(data["Huomautus"] || ""),
    grapes: String(data["Rypäleet"] || ""),
    description: String(data["Luonnehdinta"] || ""),
    packaging_type: String(data["Pakkaustyyppi"] || ""),
    closure_type: String(data["Suljentatyyppi"] || ""),
    alcohol_percentage: Number.parseFloat(data["Alkoholi-%"] || "0"),
    acidity: Number.parseFloat(data["Hapot g/l"] || "0"),
    sugar: Number.parseFloat(data["Sokeri g/l"] || "0"),
    energy: Number.parseFloat(data["Energia kcal/100 ml"] || "0"),
    selection: String(data["Valikoima"] || ""),
    ean: String(data["EAN"] || ""),
    image_url: `https://images.alko.fi/images/cs_srgb,f_auto,t_medium/cdn/${data["Numero"]}/.jpg`,
  };
  return integrationProductSchema.parse(mappedData);
}

export const typesFromProducts = (
  products: IntegrationProduct[]
): FormattedType[] => {
  const uniqueTypes = uniqBy(products, "type").map((p) => p.type);

  const translationMap: Record<string, string> = {
    Viinijuomat: "Wine Drinks",
    Alkoholittomat: "Non-Alcoholic",
    Brandyt: "Brandies, Armagnacs, And Calvados",
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
