import { listAllProducts } from "./actions";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const products = await listAllProducts();
  return <ProductsClient initialProducts={products} />;
}
