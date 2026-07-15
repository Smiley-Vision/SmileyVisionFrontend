import { ref } from 'vue'

import { type ApiProblemDetails, firstProblemMessage } from '@/modules/core/api/apiProblem'
import { useAppToast } from '@/modules/core/composables/useAppToast'

import type { FrameVariantCombination, FrameVariantRowState } from './useFrameVariants'
import type { LensSeriesRow } from './useLensSeries'
import {
  createEquipmentItemService,
  createFrameItemService,
  createLensBatchService,
} from '@/modules/admin-products/services/productItemService'
import { createProductService } from '@/modules/admin-products/services/productService'

export type CreateProductCategorySlug = 'equipos' | 'armazones' | 'micas'

interface BaseProductValues {
  category_id: number
  supplier_id: number
  image: File
  name: string
  description: string
}

interface EquipmentSubmitValues {
  sku: string
  price: number
}

interface FrameSubmitValues {
  combinations: FrameVariantCombination[]
  rows: Record<number, FrameVariantRowState>
}

interface LensSubmitValues {
  series: LensSeriesRow[]
}

interface SubmitParams {
  category: CreateProductCategorySlug
  base: BaseProductValues
  equipment?: EquipmentSubmitValues
  frame?: FrameSubmitValues
  lens?: LensSubmitValues
}

function buildBaseFormData(base: BaseProductValues): FormData {
  const formData = new FormData()

  formData.append('category_id', String(base.category_id))
  formData.append('supplier_id', String(base.supplier_id))
  formData.append('image', base.image)
  formData.append('name', base.name)
  formData.append('description', base.description)

  return formData
}

function buildItemFormData(
  productId: number,
  sku: string,
  price: number,
  image: File,
  variationOptionIds: number[] = [],
): FormData {
  const formData = new FormData()

  formData.append('product_id', String(productId))
  formData.append('image', image)
  formData.append('SKU', sku)
  formData.append('price', price.toFixed(2))

  variationOptionIds.forEach((id) => formData.append('variation_option_ids[]', String(id)))

  return formData
}

export function useCreateProductSubmit() {
  const notify = useAppToast()

  const isSubmitting = ref(false)
  const successMessage = ref<string | null>(null)

  async function submit(params: SubmitParams): Promise<boolean> {
    isSubmitting.value = true
    successMessage.value = null

    try {
      const { product } = await createProductService(buildBaseFormData(params.base))

      if (params.category === 'equipos' && params.equipment) {
        await createEquipmentItemService(
          buildItemFormData(
            product.id,
            params.equipment.sku,
            params.equipment.price,
            params.base.image,
          ),
        )

        successMessage.value = 'Equipo creado con su SKU e inventario inicial.'
      }

      if (params.category === 'armazones' && params.frame) {
        for (const combination of params.frame.combinations) {
          const row = params.frame.rows[combination.index]

          await createFrameItemService(
            buildItemFormData(product.id, combination.sku, row.price, row.image ?? params.base.image, [
              combination.colorOption.id,
              combination.materialOption.id,
            ]),
          )
        }

        successMessage.value = `Armazón creado con ${params.frame.combinations.length} combinaciones.`
      }

      if (params.category === 'micas' && params.lens) {
        let created = 0
        let skipped = 0

        for (const row of params.lens.series) {
          const result = await createLensBatchService({
            productId: product.id,
            price: row.price,
            sphereMin: row.sphereMin,
            sphereMax: row.sphereMax,
            cylinderMin: row.cylinderMin,
            cylinderMax: row.cylinderMax,
            image: row.image,
          })

          created += result.data.created_count
          skipped += result.data.skipped_count
        }

        successMessage.value = `Mica creada en ${params.lens.series.length} series. Ítems generados: ${created}. Existentes: ${skipped}.`
      }

      notify(
        'success',
        'Producto creado',
        successMessage.value ?? 'Producto creado correctamente.',
      )

      return true
    } catch (error) {
      notify('error', 'No se pudo crear el producto', firstProblemMessage(error as ApiProblemDetails))

      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return { isSubmitting, successMessage, submit }
}
