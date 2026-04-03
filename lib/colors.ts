/**
 * Converts a hex color to HSL components.
 */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/**
 * Converts HSL to a hex color string.
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Generates 5 intensity levels for a habit color:
 * - Level 0: no activity (neutral gray)
 * - Levels 1-4: increasingly saturated/bright versions of the habit color
 *
 * Returns an array of 5 hex color strings indexed [0..4].
 */
export function getIntensityColors(baseHex: string, isDark: boolean): string[] {
  const noActivity = isDark ? '#161b22' : '#ebedf0'

  try {
    const [h, s] = hexToHsl(baseHex)
    return [
      noActivity,
      hslToHex(h, Math.min(s, 100), isDark ? 25 : 75),
      hslToHex(h, Math.min(s, 100), isDark ? 40 : 60),
      hslToHex(h, Math.min(s, 100), isDark ? 55 : 45),
      hslToHex(h, Math.min(s, 100), isDark ? 65 : 35),
    ]
  } catch {
    return [noActivity, '#1e4429', '#26a641', '#39d353', '#56e869']
  }
}

/**
 * Maps a daily minute total to an intensity level (0-4)
 * based on the 90th percentile of all daily totals for that habit.
 */
export function getIntensityLevel(minutes: number, p90Minutes: number): number {
  if (minutes === 0 || p90Minutes === 0) return 0
  const ratio = minutes / p90Minutes
  if (ratio >= 1) return 4
  if (ratio >= 0.75) return 3
  if (ratio >= 0.4) return 2
  return 1
}

/**
 * Computes the 90th percentile of an array of minute values.
 */
export function computeP90(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * 0.9)
  return sorted[Math.min(idx, sorted.length - 1)]
}

/**
 * Formats minutes into a human-readable string like "1h 30m" or "45m".
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Formats total minutes as hours with 1 decimal, e.g. "12.5h".
 */
export function formatHours(minutes: number): string {
  const h = minutes / 60
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}
