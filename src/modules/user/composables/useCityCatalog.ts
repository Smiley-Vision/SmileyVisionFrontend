import { ref } from 'vue'

import { DEFAULT_CITY_OPTIONS } from '@/modules/user/constants/defaultCityOptions'
import { CITY_STATE_LABELS, City } from '@/modules/user/enums/City'
import type { Address } from '@/modules/user/interfaces/Address'
import type { CityOption } from '@/modules/user/interfaces/CityOption'

export function useCityCatalog() {
  const cityOptions = ref<CityOption[]>([...DEFAULT_CITY_OPTIONS])

  function mergeCityOption(cityId: number | null | undefined) {
    const normalizedId = Number(cityId)

    if (!normalizedId) return

    if (!cityOptions.value.some((city) => city.value === normalizedId)) {
      cityOptions.value.push({
        label: `Ciudad #${normalizedId}`,
        value: normalizedId,
      })
    }
  }

  function resolveCityName(cityId: number | null | undefined): string {
    const option = cityOptions.value.find((city) => city.value === Number(cityId))
    return option?.label ?? `Ciudad #${cityId}`
  }

  function resolveStateName(cityId: number | null | undefined): string {
    const normalizedId = Number(cityId)
    return CITY_STATE_LABELS[normalizedId as City] ?? resolveCityName(cityId)
  }

  function formatAddressLocation(address: Address): string {
    return `${resolveCityName(address.city_id)}, Mexico`
  }

  return {
    cityOptions,
    mergeCityOption,
    resolveCityName,
    resolveStateName,
    formatAddressLocation,
  }
}
