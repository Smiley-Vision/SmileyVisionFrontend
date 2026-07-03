export function formatPrice(price) {
  const priceString = price.toString()
  const priceDigits = priceString.length
  const commas = Math.floor(priceDigits / 3)
  let commaPosition = priceDigits % 3

  const priceArray = []
  let commasUsed = 0

  for (let i = 0; i < priceDigits + commas; i++) {
    if (i === commaPosition && i !== 0) {
      priceArray.push(',')
      commaPosition += 4
      commasUsed++
    } else {
      priceArray.push(price.toString().charAt(i - commasUsed))
    }
  }

  return priceArray.join('')
}
