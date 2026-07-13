"use client"

import { createTheme } from "@mui/material/styles"

export const colors = {
  blue: "#55A7E8",
  blueDark: "#A7D4F5",
  blueSoft: "#132736",
  green: "#55B68B",
  greenDark: "#A5DFC5",
  greenSoft: "#122A22",
  sand: "#24292C",
  sandSoft: "#111416",
  ink: "#F5F7F7",
  slate: "#9AA4A8",
  line: "#2A3034",
  amber: "#E7A84B",
  white: "#FFFFFF",
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: colors.blue, dark: colors.blueDark, contrastText: colors.white },
    secondary: { main: colors.green, dark: colors.greenDark, contrastText: colors.white },
    warning: { main: colors.amber },
    background: { default: "#050607", paper: "#0D1012" },
    text: { primary: colors.ink, secondary: colors.slate },
    divider: colors.line,
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.05 },
    h2: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.1 },
    h3: { fontWeight: 700, letterSpacing: 0 },
    h4: { fontWeight: 700, letterSpacing: 0 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600, letterSpacing: 0 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.75rem" },
    overline: { fontWeight: 700, letterSpacing: "0.12em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 0, paddingInline: 20, paddingBlock: 10 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.line}`,
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(5,6,7,0.92)",
          backdropFilter: "blur(10px)",
          color: colors.white,
          borderBottom: `1px solid ${colors.line}`,
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 0, fontWeight: 600 } } },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#090B0C",
          "& fieldset": { borderColor: colors.line },
          "&:hover fieldset": { borderColor: "#596269" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.line },
        head: { color: colors.white, backgroundColor: "#111416" },
      },
    },
  },
})

export default theme
