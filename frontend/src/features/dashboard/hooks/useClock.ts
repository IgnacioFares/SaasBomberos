import { useEffect, useState } from 'react'

const useClock = () => {
  const [ahora, setAhora] = useState(new Date())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  return ahora
}

export default useClock
