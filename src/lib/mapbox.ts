export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const DEFAULT_VIEW = {
  longitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? '-73.9840'),
  latitude: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? '40.7549'),
  zoom: 12,
}

export const NYC_BOUNDS: [[number, number], [number, number]] = [
  [-74.2591, 40.4774], // SW
  [-73.7004, 40.9176], // NE
]

export const COURT_LAYER_STYLES = {
  public: {
    color: '#22C55E',
    hoverColor: '#16A34A',
  },
  private: {
    color: '#1B3A5C',
    hoverColor: '#0F2942',
  },
  run: {
    color: '#FF6B2C',
    hoverColor: '#E55A1F',
  },
}

/** Map style URL */
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'
