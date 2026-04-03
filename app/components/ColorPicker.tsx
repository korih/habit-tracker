'use client'

const PRESETS = [
  '#39d353', // GitHub green
  '#58a6ff', // Blue
  '#a371f7', // Purple
  '#f78166', // Red/coral
  '#e3b341', // Yellow/gold
  '#f47067', // Salmon
  '#3fb950', // Green (alt)
  '#79c0ff', // Light blue
  '#ff7b72', // Orange-red
  '#d2a8ff', // Lavender
  '#56d364', // Mint
  '#ffa657', // Orange
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2">
        {PRESETS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={[
              'w-8 h-8 rounded-full transition-all hover:scale-110',
              value === color ? 'ring-2 ring-offset-2 ring-offset-[var(--surface)] scale-110' : '',
            ].join(' ')}
            style={{
              backgroundColor: color,
              boxShadow: value === color ? `0 0 0 2px ${color}` : undefined,
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      {/* Custom color input */}
      <div className="flex items-center gap-2 mt-1">
        <div
          className="w-8 h-8 rounded-full border border-[var(--border)] flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={e => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
          }}
          className="flex-1 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--text)] font-mono"
          placeholder="#39d353"
          maxLength={7}
        />
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
          aria-label="Pick custom color"
        />
      </div>
    </div>
  )
}
