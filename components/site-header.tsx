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
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"
import { Logo } from "./logo"

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/methodology", label: "Methodology" },
]

export default function SiteHeader() {
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = React.useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 68, gap: 2 }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit", flexGrow: 1 }}>
            <Logo />
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {NAV.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  disableRipple
                  sx={{
                    color: isActive(item.href) ? "primary.main" : "text.secondary",
                    fontWeight: isActive(item.href) ? 700 : 500,
                    "&:hover": { backgroundColor: "transparent", color: "primary.main" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                sx={{ ml: 1 }}
              >
                Open dashboard
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton edge="end" onClick={() => setOpen(true)} aria-label="Open navigation menu">
              <MenuIcon />
            </IconButton>
          )}
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
