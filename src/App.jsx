import { useState } from 'react'
import MapView from './components/MapView'
import RouteForm from './components/RouteForm'
import RouteResult from './components/RouteResult'
import { calculerTousLesItineraires } from './services/routing'

function App() {
  const [recherche, setRecherche] = useState(null)
  const [itineraires, setItineraires] = useState([])
  const [selectionne, setSelectionne] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState(null)

  const lieuxParDefaut = [
    { lat: 5.3599, lng: -4.0083, label: 'Plateau' },
    { lat: 5.3544, lng: -4.0053, label: 'Cocody' },
    { lat: 5.3122, lng: -4.0186, label: 'Treichville' },
    { lat: 5.4063, lng: -4.0305, label: 'Yopougon' },
    { lat: 5.4249, lng: -4.0305, label: 'Abobo' },
    { lat: 5.3213, lng: -4.0375, label: 'Marcory' },
  ]

  const marqueurs = recherche
    ? [
        { lat: recherche.depart.lat,  lng: recherche.depart.lng,  label: `📍 Départ : ${recherche.depart.nom}`,  type: 'depart' },
        { lat: recherche.arrivee.lat, lng: recherche.arrivee.lng, label: `🎯 Arrivée : ${recherche.arrivee.nom}`, type: 'arrivee' },
      ]
    : lieuxParDefaut

  const centreCarte = recherche
    ? [
        (recherche.depart.lat + recherche.arrivee.lat) / 2,
        (recherche.depart.lng + recherche.arrivee.lng) / 2,
      ]
    : [5.3599, -4.0083]

  const handleCalculer = async ({ depart, arrivee }) => {
    setLoading(true)
    setErreur(null)
    setItineraires([])
    setSelectionne(null)
    setRecherche({ depart, arrivee })

    try {
      const resultats = await calculerTousLesItineraires(depart, arrivee)
      setItineraires(resultats)

      const premier = resultats.find((r) => !r.erreur)
      if (premier) setSelectionne(premier.profil)
    } catch (error) {
      console.error(error)
      setErreur('Impossible de calculer les itinéraires. Vérifiez votre clé API.')
    } finally {
      setLoading(false)
    }
  }

  const itineraireAffiche = itineraires.find(
    (i) => i.profil === selectionne && !i.erreur
  )

  return (
    <div className="min-h-screen bg-ocean-50">
      <header className="bg-white shadow-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ocean-500 flex items-center justify-center text-white text-xl">
            🗺️
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-deep">
              Abidjan Trajet
            </h1>
            <p className="text-xs text-ocean-500">
              Votre guide de transport à Abidjan
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <RouteForm onCalculer={handleCalculer} loading={loading} />
        </div>

        {erreur && (
          <div className="card mb-6 bg-red-50 border border-red-200 text-red-700">
            ⚠️ {erreur}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <MapView
              markers={marqueurs}
              center={centreCarte}
              zoom={recherche ? 13 : 12}
              itineraire={itineraireAffiche}
              height="500px"
            />
          </div>

          <div>
            {recherche && (
              <RouteResult
                itineraires={itineraires}
                chargement={loading}
                selectionne={selectionne}
                onSelectionner={(itineraire) => setSelectionne(itineraire.profil)}
              />
            )}

            {!recherche && (
              <div className="card text-center py-12 text-ocean-400">
                <p className="text-5xl mb-3">🧭</p>
                <p>Entrez votre trajet pour voir les options</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App