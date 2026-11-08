/**
 * PRIORIS Control-Room Design Tokens
 * Engineered for mission-critical dispatch: air-traffic / ICU / grid operations grade.
 * High restraint, zero decorative chrome, pure semantic signaling.
 */

export const tokens = {
  colors: {
    // Neutral gray surfaces (zero navy, zero tint)
    surface: {
      base: '#0E0F11',      // Viewport background
      raised: '#15171A',    // Cards, side panels, top bar
      overlay: '#1C1F23',   // Active rows, popovers, menus
      subtle: '#24272D',    // Hover states, subtle separators
    },
    // Hairline borders
    border: {
      subtle: '#2A2D33',    // Default hairline border
      strong: '#3B4048',    // Focused element / active boundary
      highlight: '#ECEDEF', // Selected ward outline
    },
    // Typography contrast (all >= 4.5:1 against #0E0F11 and #15171A)
    text: {
      primary: '#ECEDEF',   // Primary headers, ward titles, score values
      secondary: '#A1A5AD', // Section titles, metadata, factor labels
      muted: '#858A93',     // Timestamps, inactive hints
    },
    // Primary Action (Off-white with dark text - highest contrast on panel, passes squint test)
    buttonPrimary: {
      bg: '#ECEDEF',
      text: '#0E0F11',
      hover: '#FFFFFF',
    },
    // Strictly Semantic Risk Colors (ONLY used for risk & severity)
    severity: {
      critical: {
        solid: '#F2555A',
        bg: 'rgba(242, 85, 90, 0.12)',
        border: '#F2555A',
        text: '#F2555A',
      },
      high: {
        solid: '#F5832B',
        bg: 'rgba(245, 131, 43, 0.12)',
        border: '#F5832B',
        text: '#F5832B',
      },
      moderate: {
        solid: '#E8B923',
        bg: 'rgba(232, 185, 35, 0.12)',
        border: '#E8B923',
        text: '#E8B923',
      },
      low: {
        solid: '#4CB782',
        bg: 'rgba(76, 183, 130, 0.12)',
        border: '#4CB782',
        text: '#4CB782',
      },
    },
    // Hydrology Blue (The ONLY use of blue on the entire screen)
    water: {
      river: '#4C9BE8',
      floodExtent: 'rgba(76, 155, 232, 0.22)',
    },
    // Route & Obstruction Signals
    routing: {
      recommended: '#FFFFFF', // Solid white 3px line
      blocked: '#F2555A',     // Dashed red line
    },
  },
  typography: {
    fontSans: "'IBM Plex Sans', 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    fontDevanagari: "'Noto Sans Devanagari', 'IBM Plex Sans', sans-serif",
    sizes: {
      xs: '12px',    // Minimum text size across entire app, section labels
      sm: '14px',    // Standard body text
      base: '16px',  // Card titles, ward names
      lg: '20px',    // Panel headers, score displays
      xl: '28px',    // Dominant key numbers
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    full: '9999px',
  },
} as const

export type PrioritySeverity = 'Critical' | 'High' | 'Moderate' | 'Low'

export function getSeverityColors(priority: PrioritySeverity) {
  switch (priority) {
    case 'Critical':
      return tokens.colors.severity.critical
    case 'High':
      return tokens.colors.severity.high
    case 'Moderate':
      return tokens.colors.severity.moderate
    case 'Low':
    default:
      return tokens.colors.severity.low
  }
}
