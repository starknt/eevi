export function when<T>(condition: T, result: T) {
  return new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      if (condition === result) {
        clearInterval(timer)
        resolve()
      }
    }, 16)
  })
}

export function debounce(fn: (...args: any[]) => any, ms = 500) {
  let timer: number | null = null
  return function (...args: any[]) {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(() => {
      // @ts-expect-error any ok
      fn.call(this, ...args)
    }, ms) as any as number
  }
}

export function printRow(n: number) {
  for (let i = 0; i < n; i++)
    // eslint-disable-next-line no-console
    console.log()
}
