// Fonction serverless Vercel : proxy vers Geoapify
// Doc : https://vercel.com/docs/functions

export default async function handler(req, res) {
  // Autoriser uniquement les requêtes depuis notre app
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Gérer les requêtes preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Récupérer la clé API depuis les variables d'environnement Vercel
  const API_KEY = process.env.GEOAPIFY_API_KEY

  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'Clé API Geoapify non configurée sur le serveur' 
    })
  }

  // Récupérer le chemin demandé et les query params
  const { path, ...query } = req.query

  if (!path) {
    return res.status(400).json({ 
      error: 'Paramètre "path" manquant. Exemple : /api/geoapify?path=routing&waypoints=...' 
    })
  }

  // Construire l'URL Geoapify
  const geoapifyPath = path  // "routing" ou "geocode/search" ou "geocode/reverse"
  const params = new URLSearchParams({
    ...query,
    apiKey: API_KEY,
  })

  const geoapifyUrl = `https://api.geoapify.com/v1/${geoapifyPath}?${params}`

  try {
    const response = await fetch(geoapifyUrl)
    const data = await response.json()

    // Retourner la réponse avec le même status
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Erreur proxy Geoapify:', error)
    return res.status(500).json({ 
      error: 'Erreur lors de la requête vers Geoapify',
      details: error.message 
    })
  }
}