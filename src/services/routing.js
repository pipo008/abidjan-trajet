// Service de calcul d'itinéraires via Geoapify (via proxy serverless)

// En production (Vercel), on utilise /api/geoapify
// En développement (Vite), le proxy est configuré dans vite.config.js
const API_BASE = import.meta.env.DEV 
  ? 'https://api.geoapify.com/v1'   // dev : appel direct
  : '/api/geoapify'                  // prod : via serverless

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

export const PROFILS = {
  voiture: { geo: 'drive',   emoji: '🚗', label: 'Voiture / Taxi' },
  marche:  { geo: 'walk',    emoji: '🚶', label: 'Marche' },
  velo:    { geo: 'bicycle', emoji: '🚴', label: 'Vélo' },
}

/**
 * Calcule un itinéraire entre deux points
 */
export async function calculerItineraire(depart, arrivee, profil = 'voiture') {
  const profilGeo = PROFILS[profil]?.geo || 'drive'
  const waypoints = `${depart.lat},${depart.lng}|${arrivee.lat},${arrivee.lng}`

  let url

  if (import.meta.env.DEV) {
    // Développement : appel direct
    if (!API_KEY) throw new Error('Clé API Geoapify manquante')
    const params = new URLSearchParams({
      waypoints,
      mode: profilGeo,
      apiKey: API_KEY,
    })
    url = `${API_BASE}/routing?${params}`
  } else {
    // Production : via proxy serverless
    const params = new URLSearchParams({
      path: 'routing',
      waypoints,
      mode: profilGeo,
    })
    url = `${API_BASE}?${params}`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      throw new Error('Aucun itinéraire trouvé')
    }

    const feature = data.features[0]
    const props = feature.properties
    const geometry = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])

    return {
      profil,
      distance: props.distance,
      duree: props.time,
      geometry,
    }
  } catch (error) {
    console.error(`Erreur calcul ${profil}:`, error)
    throw error
  }
}

export async function calculerTousLesItineraires(depart, arrivee) {
  const profils = ['voiture', 'marche', 'velo']
  const resultats = await Promise.allSettled(
    profils.map((p) => calculerItineraire(depart, arrivee, p))
  )
  return resultats.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { profil: profils[i], erreur: true }
  )
}

// ---------- Formatage ----------

export function formaterDuree(secondes) {
  const minutes = Math.round(secondes / 60)
  if (minutes < 60) return `${minutes} min`
  const heures = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${heures}h${mins}` : `${heures}h`
}

export function formaterDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(1)} km`
}

export function estimerPrix(profil, distanceMetres) {
  const km = distanceMetres / 1000
  switch (profil) {
    case 'voiture': return Math.max(1000, Math.round(km * 200))
    case 'moto':    return Math.max(200, Math.round(km * 100))
    default:        return 0
  }
}