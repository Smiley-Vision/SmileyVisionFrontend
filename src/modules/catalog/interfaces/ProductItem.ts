export interface ProductItem {
  id: number
  product_id: number
  image_path: string
  SKU: string
  // The backend serializes decimal columns (price) as strings.
  price: number | string
  stock: number
}
