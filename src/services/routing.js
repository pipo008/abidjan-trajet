// Service de calcul d'itinéraires via Geoapify
// Documentation : https://apidocs.geoapify.com/docs/routing/

const GEOAPIFY_URL = 'https://api.geoapify.com/v1/routing'

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

// Profils Geoapify
export const PROFILS = {
  voiture: { geo: 'drive',   emoji: '🚗', label: 'Voiture / Taxi' },
  marche:  { geo: 'walk',    emoji: '🚶', label: 'Marche' },
  velo:    { geo: 'bicycle', emoji: '🚴', label: 'Vélo' },
}

/**
 * Calcule un itinéraire entre deux points via Geoapify
 */
export async function calculerItineraire(depart, arrivee, profil = 'voiture') {
  if (!API_KEY) {
    throw new Error('Clé API Geoapify manquante. Vérifiez votre fichier .env')
  }

  const profilGeo = PROFILS[profil]?.geo || 'drive'

  // Geoapify attend : waypoints=lat1,lng1|lat2,lng2
  const waypoints = `${depart.lat},${depart.lng}|${arrivee.lat},${arrivee.lng}`

  const params = new URLSearchParams({
    waypoints: waypoints,
    mode: profilGeo,
    apiKey: API_KEY,
  })

  try {
    const response = await fetch(`${GEOAPIFY_URL}?${params}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur Geoapify:', errorText)
      throw new Error(`Erreur API : ${response.status}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      throw new Error('Aucun itinéraire trouvé')
    }

    const feature = data.features[0]
    const props = feature.properties

    // Geoapify retourne la géométrie en [lng, lat], on inverse pour Leaflet
    const geometry = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])

    return {
      profil,
      distance: props.distance,          // en mètres
      duree: props.time,                 // en secondes
      geometry,
    }
  } catch (error) {
    console.error(`Erreur calcul ${profil}:`, error)
    throw error
  }
}

/**
 * Calcule les 3 profils en parallèle
 */
export async function calculerTousLesItineraires(depart, arrivee) {
  const profils = ['voiture', 'marche', 'velo']

  const resultats = await Promise.allSettled(
    profils.map((p) => calculerItineraire(depart, arrivee, p))
  )

  return resultats.map((r, i) => {
    if (r.status === 'fulfilled') {
      return r.value
    } else {
      console.warn(`Échec du profil ${profils[i]}:`, r.reason)
      return { profil: profils[i], erreur: true }
    }
  })
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
    case 'voiture':
      return Math.max(1000, Math.round(km * 200))
    case 'moto':
      return Math.max(200, Math.round(km * 100))
    default:
      return 0
  }
}