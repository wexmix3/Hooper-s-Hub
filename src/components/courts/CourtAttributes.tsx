import { Layers, Sun, Moon, Zap, Maximize2, Target } from 'lucide-react'
import type { Court } from '@/types'

interface CourtAttributesProps {
  court: Court
}

const SURFACE_LABELS: Record<string, string> = {
  asphalt: 'Asphalt',
  concrete: 'Concrete',
  hardwood: 'Hardwood',
  rubber: 'Rubber',
  sport_court: 'Sport Court',
  other: 'Other',
}

export function CourtAttributes({ court }: CourtAttributesProps) {
  const attrs = [
    {
      icon: <Layers size={18} className="text-[#1B3A5C]" />,
      label: 'Surface',
      value: court.surface_type ? SURFACE_LABELS[court.surface_type] : 'Unknown',
    },
    {
      icon: court.indoor ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />,
      label: 'Setting',
      value: court.indoor ? 'Indoor' : 'Outdoor',
    },
    {
      icon: <Zap size={18} className="text-amber-400" />,
      label: 'Lights',
      value: court.has_lights ? 'Yes' : 'No',
    },
    {
      icon: <Target size={18} className="text-[#FF6B2C]" />,
      label: 'Rims',
      value: `${court.rim_count} × ${court.rim_height}`,
    },
    ...(court.court_dimensions
      ? [
          {
            icon: <Maximize2 size={18} className="text-slate-500" />,
            label: 'Dimensions',
            value: court.court_dimensions,
          },
        ]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {attrs.map((attr) => (
        <div key={attr.label} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
          {attr.icon}
          <div>
            <p className="text-xs text-slate-500 font-medium">{attr.label}</p>
            <p className="text-sm font-bold text-slate-900">{attr.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
