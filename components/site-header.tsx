"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { Logo } from "./logo"

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/methodology", label: "Methodology" },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        bgcolor: "transparent",
        backgroundImage: "none",
        backdropFilter: "none",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        color: "#fff",
        zIndex: (currentTheme) => currentTheme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 68, gap: 2 }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit", flexGrow: 1 }}>
            <Logo light />
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
              {NAV.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  disableRipple
                  sx={{
                    color: isActive(item.href) ? "#fff" : "rgba(255,255,255,0.64)",
                    fontWeight: isActive(item.href) ? 700 : 500,
                    "&:hover": { backgroundColor: "transparent", color: "#fff" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                sx={{
                  ml: 1,
                  borderRadius: 0,
                  bgcolor: "#fff",
                  color: "#050607",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.84)" },
                }}
              >
                Open dashboard
              </Button>
          </Box>

          <IconButton
            edge="end"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            sx={{ display: { xs: "inline-flex", md: "none" }, color: "#fff" }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ px: 2, pb: 1 }}>
            <Logo />
          </Box>
          <List>
            {NAV.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={isActive(item.href)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}
