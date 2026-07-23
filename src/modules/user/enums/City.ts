export enum City {
  SanFranciscoDeCampeche = 1,
  CiudadDeMexico = 2,
  Villahermosa = 3,
  Merida = 4,
}

export const CITY_LABELS: Record<City, string> = {
  [City.SanFranciscoDeCampeche]: 'San Francisco de Campeche',
  [City.CiudadDeMexico]: 'Ciudad de Mexico',
  [City.Villahermosa]: 'Villahermosa',
  [City.Merida]: 'Merida',
}

export const CITY_STATE_LABELS: Record<City, string> = {
  [City.SanFranciscoDeCampeche]: 'Campeche',
  [City.CiudadDeMexico]: 'Ciudad de Mexico',
  [City.Villahermosa]: 'Tabasco',
  [City.Merida]: 'Yucatan',
}
