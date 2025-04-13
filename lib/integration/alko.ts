import { integrationProductSchema } from "@/schemas/product";
import { IntegrationProduct } from "@/types/product";

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
    type: String(data["Tyyppi"] || ""),
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
