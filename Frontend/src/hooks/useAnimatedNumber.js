import { useState, useEffect, useRef } from 'react'

export function useAnimatedNumber(target, duration = 1200, start = false) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    if (!start) return
    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCurrent(target)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, start])

  return current
}
