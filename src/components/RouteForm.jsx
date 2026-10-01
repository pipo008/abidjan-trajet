import { useState } from 'react'
import { MapPin, Navigation, ArrowRightLeft, Search, Locate, Loader2 } from 'lucide-react'
import { useAdresseSearch } from '../hooks/useAdresseSearch'
import { reverseGeocoding } from '../services/geocoding'

export default function RouteForm({ onCalculer, loading = false }) {
  const [depart, setDepart] = useState(null)   // {lat, lng, nom, label}
  const [arrivee, setArrivee] = useState(null)
  const [departTexte, setDepartTexte] = useState('')
  const [arriveeTexte, setArriveeTexte] = useState('')
  const [locating, setLocating] = useState(false)

  const [focusField, setFocusField] = useState(null) // 'depart' ou 'arrivee'

  // Recherche pour départ
  const { suggestions: suggestionsDepart, loading: loadingDepart } = 
    useAdresseSearch(focusField === 'depart' ? departTexte : '')
  
  // Recherche pour arrivée
  const { suggestions: suggestionsArrivee, loading: loadingArrivee } = 
    useAdresseSearch(focusField === 'arrivee' ? arriveeTexte : '')

  // Sélectionner une suggestion
  const selectionnerDepart = (suggestion) => {
    setDepart(suggestion)
    setDepartTexte(suggestion.nom)
    setFocusField(null)
  }

  const selectionnerArrivee = (suggestion) => {
    setArrivee(suggestion)
    setArriveeTexte(suggestion.nom)
    setFocusField(null)
  }

  // Ma position
  const utiliserMaPosition = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const adresse = await reverseGeocoding(latitude, longitude)

        setDepart({
          lat: latitude,
          lng: longitude,
          nom: adresse.nom,
          label: adresse.label,
        })
        setDepartTexte(adresse.nom)
        setLocating(false)
      },
      (error) => {
        console.error(error)
        alert('Impossible de récupérer votre position.')
        setLocating(false)
      }
    )
  }

  // Inverser
  const inverser = () => {
    setDepart(arrivee)
    setArrivee(depart)
    setDepartTexte(arriveeTexte)
    setArriveeTexte(departTexte)
  }

  // Soumettre
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!depart || !arrivee) {
      alert('Veuillez sélectionner une adresse dans les suggestions.')
      return
    }
    onCalculer({ depart, arrivee })
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="font-display font-bold text-lg mb-4 text-deep">
        🧭 Calculer mon trajet
      </h2>

      <div className="space-y-3 mb-4">
        
        {/* Départ */}
        <div className="relative">
          <label className="label flex items-center gap-1.5">
            <MapPin size={14} className="text-green-600" />
            Point de départ
          </label>
          <div className="relative">
            <input
              type="text"
              value={departTexte}
              onChange={(e) => {
                setDepartTexte(e.target.value)
                setDepart(null)
              }}
              onFocus={() => setFocusField('depart')}
              placeholder="Ex: Cocody, Abidjan"
              className="input pr-10"
            />
            
            {/* Bouton position OU loader */}
            <button
              type="button"
              onClick={utiliserMaPosition}
              disabled={locating}
              title="Utiliser ma position actuelle"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                         text-ocean-500 hover:bg-ocean-100 transition-colors
                         disabled:opacity-50"
            >
              {locating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Locate size={16} />
              )}
            </button>
          </div>

          {/* Suggestions */}
          {focusField === 'depart' && (suggestionsDepart.length > 0 || loadingDepart) && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-ocean-100 max-h-60 overflow-y-auto">
              {loadingDepart ? (
                <div className="p-3 text-center text-ocean-400 text-sm">
                  <Loader2 size={16} className="animate-spin inline mr-2" />
                  Recherche...
                </div>
              ) : (
                suggestionsDepart.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectionnerDepart(s)}
                    className="w-full text-left p-3 hover:bg-ocean-50 transition-colors
                               border-b border-ocean-50 last:border-0"
                  >
                    <p className="font-medium text-deep text-sm">{s.nom}</p>
                    <p className="text-xs text-ocean-400 truncate">{s.label}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bouton inverser */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={inverser}
            title="Inverser départ et arrivée"
            className="w-9 h-9 rounded-full bg-ocean-100 hover:bg-ocean-200
                       flex items-center justify-center text-ocean-600
                       transition-all hover:rotate-180 duration-300"
          >
            <ArrowRightLeft size={16} />
          </button>
        </div>

        {/* Arrivée */}
        <div className="relative">
          <label className="label flex items-center gap-1.5">
            <Navigation size={14} className="text-red-500" />
            Point d'arrivée
          </label>
          <input
            type="text"
            value={arriveeTexte}
            onChange={(e) => {
              setArriveeTexte(e.target.value)
              setArrivee(null)
            }}
            onFocus={() => setFocusField('arrivee')}
            placeholder="Ex: Plateau, Abidjan"
            className="input"
          />

          {/* Suggestions */}
          {focusField === 'arrivee' && (suggestionsArrivee.length > 0 || loadingArrivee) && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-ocean-100 max-h-60 overflow-y-auto">
              {loadingArrivee ? (
                <div className="p-3 text-center text-ocean-400 text-sm">
                  <Loader2 size={16} className="animate-spin inline mr-2" />
                  Recherche...
                </div>
              ) : (
                suggestionsArrivee.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectionnerArrivee(s)}
                    className="w-full text-left p-3 hover:bg-ocean-50 transition-colors
                               border-b border-ocean-50 last:border-0"
                  >
                    <p className="font-medium text-deep text-sm">{s.nom}</p>
                    <p className="text-xs text-ocean-400 truncate">{s.label}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Résumé de la sélection */}
      {(depart || arrivee) && (
        <div className="bg-ocean-50 rounded-xl p-3 mb-4 text-xs space-y-1">
          {depart && (
            <p className="text-ocean-700">
              📍 <strong>Départ :</strong> {depart.nom}
              <span className="text-ocean-400">
                {' '}({depart.lat.toFixed(4)}, {depart.lng.toFixed(4)})
              </span>
            </p>
          )}
          {arrivee && (
            <p className="text-ocean-700">
              🎯 <strong>Arrivée :</strong> {arrivee.nom}
              <span className="text-ocean-400">
                {' '}({arrivee.lat.toFixed(4)}, {arrivee.lng.toFixed(4)})
              </span>
            </p>
          )}
        </div>
      )}

      {/* Bouton calculer */}
      <button
        type="submit"
        disabled={loading || !depart || !arrivee}
        className="btn-primary w-full flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search size={18} />
        {loading ? 'Calcul en cours...' : 'Calculer le trajet'}
      </button>

      <p className="text-xs text-ocean-400 text-center mt-3">
        💡 Tapez au moins 3 caractères et choisissez une suggestion
      </p>
    </form>
  )
}