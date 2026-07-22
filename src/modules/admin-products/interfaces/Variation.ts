export interface VariationOption {
  id: number
  value: string
}

export interface Variation {
  id: number
  category_id: number
  name: string
  variation_options: VariationOption[]
}
