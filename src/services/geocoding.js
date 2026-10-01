// Service de géocodage via Geoapify
// Documentation : https://apidocs.geoapify.com/docs/geocoding/

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/geocode'

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

// Biais géographique : Abidjan
const ABIDJAN_BIAS = 'proximity:-4.0083,5.3599'

/**
 * Recherche d'adresses (autocomplete)
 */
export async function rechercherAdresse(query, limit = 5) {
  if (!query || query.trim().length < 3) return []

  if (!API_KEY) {
    console.error('Clé API Geoapify manquante')
    return []
  }

  try {
    // On ajoute "Abidjan" si pas déjà présent pour biaiser la recherche
    const queryAvecVille = query.toLowerCase().includes('abidjan') 
      ? query 
      : `${query}, Abidjan, Côte d'Ivoire`

    const params = new URLSearchParams({
      text: queryAvecVille,
      format: 'json',
      limit: limit,
      apiKey: API_KEY,
      bias: ABIDJAN_BIAS,
      lang: 'fr',
    })

    const response = await fetch(`${GEOAPIFY_URL}/search?${params}`)

    if (!response.ok) {
      console.error('Erreur Geoapify Geocoding:', response.status)
      return []
    }

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

/**
 * Fallback sans filtre (recherche large)
 */
export async function rechercherAdresseLarge(query, limit = 5) {
  return rechercherAdresse(query, limit)
}

/**
 * Géocodage inverse : coordonnées → adresse
 */
export async function reverseGeocoding(lat, lng) {
  if (!API_KEY) {
    return { label: `${lat}, ${lng}`, nom: 'Ma position' }
  }

  try {
    const params = new URLSearchParams({
      lat: lat,
      lon: lng,
      format: 'json',
      apiKey: API_KEY,
      lang: 'fr',
    })

    const response = await fetch(`${GEOAPIFY_URL}/reverse?${params}`)

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