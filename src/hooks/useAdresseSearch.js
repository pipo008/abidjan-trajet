import { useState, useEffect } from 'react'
import { rechercherAdresse, rechercherAdresseLarge } from '../services/geocoding'

/**
 * Hook de recherche d'adresse avec debounce
 */
export function useAdresseSearch(query, delay = 400) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)

      // 1. Recherche à Abidjan
      let results = await rechercherAdresse(query)

      // 2. Si rien trouvé, recherche large
      if (results.length === 0) {
        results = await rechercherAdresseLarge(query)
      }

      setSuggestions(results)
      setLoading(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, delay])

  return { suggestions, loading }
}