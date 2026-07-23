import smileyApi from '@/modules/core/api/smileyApi'

import type { BranchOffice } from '@/modules/inventory/interfaces/BranchOffice'

interface ApiListResponse<T> {
  data: T[]
}

export async function getBranchOfficesService() {
  return (await smileyApi.get<ApiListResponse<BranchOffice>>('/branch-offices')).data
}
