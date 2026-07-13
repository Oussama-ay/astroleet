"use client"

import { createTheme } from "@mui/material/styles"

// Astroleat palette: scientific blue, vegetation green, desert sand + neutrals
export const colors = {
  blue: "#0F5FA6",
  blueDark: "#0B4478",
  blueSoft: "#E4EEF7",
  green: "#2E8B6B",
  greenDark: "#1F6650",
  greenSoft: "#E2F0EA",
  sand: "#E9DEC8",
  sandSoft: "#F6F1E7",
  ink: "#16242C",
  slate: "#5A6B72",
  line: "#DED6C4",
  amber: "#C98A2B",
  white: "#FFFFFF",
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: colors.blue, dark: colors.blueDark, contrastText: colors.white },
    secondary: { main: colors.green, dark: colors.greenDark, contrastText: colors.white },
    warning: { main: colors.amber },
    background: { default: colors.sandSoft, paper: colors.white },
    text: { primary: colors.ink, secondary: colors.slate },
    divider: colors.line,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 },
    h2: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600, letterSpacing: "0.01em" },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: "0.12em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, paddingInline: 20, paddingBlock: 9 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.line}`,
          boxShadow: "0 1px 2px rgba(22,36,44,0.04)",
        },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(246,241,231,0.85)",
          backdropFilter: "blur(10px)",
          color: colors.ink,
          borderBottom: `1px solid ${colors.line}`,
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
})

export default theme
