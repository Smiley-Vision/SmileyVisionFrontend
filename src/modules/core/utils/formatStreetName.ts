export const formatStreetName = (street: string): string => {
  return street.startsWith('Calle ') ?
  street : 'Calle ' + street
}