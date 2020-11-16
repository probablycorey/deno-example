export const plural = (singular: string, plural: string | number, number: number | undefined) => {
  if (number === undefined) {
    number = plural as number
    plural = singular + 's'
  }

  return `${number} ${number == 1 ? singular : plural}`
}

export const random = <T>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}
