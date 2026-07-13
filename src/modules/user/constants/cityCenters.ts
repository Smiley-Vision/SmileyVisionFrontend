import { City } from '@/modules/user/enums/City'

export interface CityCenter {
  lat: number
  lng: number
}

export const CITY_CENTERS: Record<City, CityCenter> = {
  [City.SanFranciscoDeCampeche]: { lat: 19.833141, lng: -90.521352 },
  [City.CiudadDeMexico]: { lat: 19.4326, lng: -99.1332 },
  [City.Villahermosa]: { lat: 17.9895, lng: -92.9475 },
  [City.Merida]: { lat: 20.9674, lng: -89.5926 },
}

export function getCityCenter(cityId: number | null | undefined): CityCenter {
  return CITY_CENTERS[cityId as City] ?? CITY_CENTERS[City.SanFranciscoDeCampeche]
}
