import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Correction des icônes Leaflet par défaut
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const ABIDJAN_CENTER = [5.3599, -4.0083]

function FitBounds({ markers, itineraire }) {
  const map = useMap()

  useEffect(() => {
    try {
      if (itineraire && itineraire.geometry?.length > 0) {
        const bounds = L.latLngBounds(itineraire.geometry)
        map.fitBounds(bounds, { padding: [50, 50] })
      } else if (markers.length >= 2) {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]))
        map.fitBounds(bounds, { padding: [50, 50] })
      } else if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], 14)
      }
    } catch (e) {
      console.warn('FitBounds error:', e)
    }
  }, [markers, itineraire, map])

  return null
}

export default function MapView({
  center = ABIDJAN_CENTER,
  zoom = 12,
  markers = [],
  itineraire = null,
  height = '500px',
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-soft"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Tracé de l'itinéraire */}
        {itineraire && itineraire.geometry && itineraire.geometry.length > 0 && (
          <>
            <Polyline
              positions={itineraire.geometry}
              pathOptions={{
                color: '#FFFFFF',
                weight: 8,
                opacity: 0.9,
              }}
            />
            <Polyline
              positions={itineraire.geometry}
              pathOptions={{
                color: '#0284C7',
                weight: 5,
                opacity: 1,
              }}
            />
          </>
        )}

        {/* Marqueurs (icônes par défaut) */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${index}`}
            position={[marker.lat, marker.lng]}
          >
            {marker.label && (
              <Popup>
                <strong>{marker.label}</strong>
                {marker.description && (
                  <p className="text-sm text-gray-600">{marker.description}</p>
                )}
              </Popup>
            )}
          </Marker>
        ))}

        <FitBounds markers={markers} itineraire={itineraire} />
      </MapContainer>
    </div>
  )
}