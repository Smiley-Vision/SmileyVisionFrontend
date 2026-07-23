export interface CartItemVariationOption {
  variation_id: number | null
  variation_name: string
  option_id: number | null
  option_value: string
}

export interface CartItem {
  cart_id: number | null
  product_item_id: number
  product_id: number | null
  category_id: number | null
  code: string
  sku: string
  name: string
  description: string
  image_path: string
  price: number
  stock: number
  variation_options: CartItemVariationOption[]
  quantity: number
}

export interface CartProductInput {
  id?: number | string | null
  product_item_id?: number | string | null
  category_id?: number | string | null
  code?: string | null
  SKU?: string | null
  name?: string | null
  description?: string | null
  image_path?: string | null
  product_image?: string | null
  price?: number | string | null
  stock?: number | string | null
  variation_options?: CartItemVariationOption[] | null
}

export interface RawShoppingCartItem {
  cart_id?: number | string | null
  product_item_id: number | string
  quantity: number | string
}

export interface LensDetails {
  sphere: number
  cylinder: number
}
