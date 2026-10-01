// Service de géocodage via Geoapify (via proxy serverless)

const API_BASE = import.meta.env.DEV 
  ? 'https://api.geoapify.com/v1' 
  : '/api/geoapify'

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

const ABIDJAN_BIAS = 'proximity:-4.0083,5.3599'

export async function rechercherAdresse(query, limit = 5) {
  if (!query || query.trim().length < 3) return []

  try {
    const queryAvecVille = query.toLowerCase().includes('abidjan') 
      ? query 
      : `${query}, Abidjan, Côte d'Ivoire`

    let url

    if (import.meta.env.DEV) {
      if (!API_KEY) return []
      const params = new URLSearchParams({
        text: queryAvecVille,
        format: 'json',
        limit: limit,
        apiKey: API_KEY,
        bias: ABIDJAN_BIAS,
        lang: 'fr',
      })
      url = `${API_BASE}/geocode/search?${params}`
    } else {
      const params = new URLSearchParams({
        path: 'geocode/search',
        text: queryAvecVille,
        format: 'json',
        limit: limit,
        bias: ABIDJAN_BIAS,
        lang: 'fr',
      })
      url = `${API_BASE}?${params}`
    }

    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()

    return (data.results || []).map((item) => ({
      lat: item.lat,
      lng: item.lon,
      label: item.formatted,
      nom: item.address_line1 || item.name || item.formatted?.split(',')[0],
      type: item.result_type,
    }))
  } catch (error) {
    console.error('Erreur géocodage:', error)
    return []
  }
}

export async function rechercherAdresseLarge(query, limit = 5) {
  return rechercherAdresse(query, limit)
}

export async function reverseGeocoding(lat, lng) {
  try {
    let url

    if (import.meta.env.DEV) {
      if (!API_KEY) return { label: `${lat}, ${lng}`, nom: 'Ma position' }
      const params = new URLSearchParams({
        lat: lat,
        lon: lng,
        format: 'json',
        apiKey: API_KEY,
        lang: 'fr',
      })
      url = `${API_BASE}/geocode/reverse?${params}`
    } else {
      const params = new URLSearchParams({
        path: 'geocode/reverse',
        lat: lat,
        lon: lng,
        format: 'json',
        lang: 'fr',
      })
      url = `${API_BASE}?${params}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Erreur reverse geocoding')

    const data = await response.json()
    const result = data.results?.[0]

    return {
      label: result?.formatted || `${lat}, ${lng}`,
      nom: result?.address_line1 || result?.name || 'Ma position',
    }
  } catch (error) {
    console.error('Erreur reverse geocoding:', error)
    return { label: `${lat}, ${lng}`, nom: 'Ma position' }
  }
}