import { Car, Footprints, Bike, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { PROFILS, formaterDuree, formaterDistance, estimerPrix } from '../services/routing'

const ICONES = {
  voiture: Car,
  marche:  Footprints,
  velo:    Bike,
}

const COULEURS = {
  voiture: { bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-700' },
  marche:  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  velo:    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
}

export default function RouteResult({ itineraires, chargement, onSelectionner, selectionne }) {
  if (chargement) {
    return (
      <div className="card text-center py-12">
        <Loader2 size={32} className="animate-spin text-ocean-500 mx-auto mb-3" />
        <p className="text-ocean-600">Calcul des itinéraires en cours...</p>
      </div>
    )
  }

  if (!itineraires || itineraires.length === 0) return null

  return (
    <div>
      <h2 className="font-display font-bold text-lg mb-4 text-deep">
        🚗 Options de trajet
      </h2>

      <div className="space-y-3">
        {itineraires.map((itineraire, i) => {
          const profil = itineraire.profil
          const info = PROFILS[profil]
          const Icone = ICONES[profil]
          const couleurs = COULEURS[profil]
          const estSelectionne = selectionne === profil

          // Cas d'erreur
          if (itineraire.erreur) {
            return (
              <div
                key={i}
                className="card border border-red-100 bg-red-50/50 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">
                      {info.emoji} {info.label}
                    </p>
                    <p className="text-xs text-red-500">
                      Itinéraire indisponible
                    </p>
                  </div>
                </div>
              </div>
            )
          }

          const prix = estimerPrix(profil, itineraire.distance)

          return (
            <button
              key={i}
              onClick={() => onSelectionner?.(itineraire)}
              className={`card w-full text-left transition-all border-2
                ${estSelectionne
                  ? `${couleurs.border} ${couleurs.bg} shadow-soft`
                  : 'border-transparent hover:border-ocean-200'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${couleurs.bg} ${couleurs.text}`}>
                  <Icone size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-display font-bold ${couleurs.text}`}>
                    {info.emoji} {info.label}
                    {estSelectionne && (
                      <span className="ml-2 text-xs font-normal bg-ocean-500 text-white px-2 py-0.5 rounded-full">
                        Sélectionné
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-deep/70">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      <strong>{formaterDuree(itineraire.duree)}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {formaterDistance(itineraire.distance)}
                    </span>
                    {prix > 0 && (
                      <span className="font-medium text-ocean-600">
                        ~{prix.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                    {prix === 0 && (
                      <span className="text-green-600 font-medium">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-ocean-400 text-center mt-3">
        💰 Les prix sont des estimations (~200 FCFA/km en taxi)
      </p>
    </div>
  )
}