"use client"

import { useEffect, useState } from "react"

export function useCounter(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return

    const steps = 40
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    let step = 0

    const id = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      current = Math.round(target * eased)
      setValue(current)
      if (step >= steps) {
        setValue(target)
        clearInterval(id)
      }
    }, interval)

    return () => clearInterval(id)
  }, [target, duration, active])

  return value
}
