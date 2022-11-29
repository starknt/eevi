export function sum(...nums: number[]) {
  let sum = 0
  for (const num of nums)
    sum += num

  return sum
}
