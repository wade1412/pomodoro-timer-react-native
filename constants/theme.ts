export const theme = {
  // ----- Colors -----
  colors: {
    //  Main
    background: "#0F0F12", // main bg
    surface: "#1A1A20", // cards, rows
    surfaceElevated: "#202027", // inputs, selected elements
    border: "#2A2A33",
    textPrimary: "#F4F2F1", // headers and timer text
    textSecondary: "#9291A3", // subtitles, dates
    textMuted: "#646577",

    //  Focus
    focus: "#F08058", // primary button,
    focusPressed: "#D96D48",
    focusSoft: "#4A2D27", // focus bg, glow

    // Break
    break: "#43D3B5",
    breakPressed: "#2ea791",
    breakSoft: "#1D443F",

    //  Other
    progressTrack: "#292A34",
    tabInactive: "#696A7A",
    danger: "#E06666",
    overlay: "rgba(0, 0, 0, 0.55)",
  },

  // ----- Spacing -----
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
  },

  // ----- Radius -----
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    round: 999,
  },

  // ----- Typography -----
  typography: {
    screenTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "300",
    },

    sectionTitle: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
    },

    body: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "400",
    },

    caption: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "400",
    },

    metric: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "500",
    },

    timer: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: "400",
    },

    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "500",
    },
  },
} as const;
