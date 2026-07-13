"use client"

import Link from "next/link"
import { Box, Container, Typography, Divider, Stack } from "@mui/material"
import { Logo } from "./logo"

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ mt: "auto", backgroundColor: "#050607", color: "#CBD5D1", borderTop: "1px solid #2A3034" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 340 }}>
            <Logo light />
            <Typography variant="body2" sx={{ mt: 1.5, color: "#9FB0AE", lineHeight: 1.6 }}>
              Satellite-derived environmental intelligence for Morocco. Built for
              researchers, planners and land stewards who need transparent, verifiable data.
            </Typography>
          </Box>
          <Stack direction="row" spacing={6}>
            <Box>
              <Typography variant="overline" sx={{ color: "#7E918F" }}>
                Explore
              </Typography>
              <Stack sx={{ mt: 1 }} spacing={1}>
                <FooterLink href="/">Overview</FooterLink>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
                <FooterLink href="/methodology">Methodology</FooterLink>
              </Stack>
            </Box>
          </Stack>
        </Stack>
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />
        <Typography variant="caption" sx={{ color: "#7E918F" }}>
          © {new Date().getFullYear()} Astroleet. Demonstration data derived from open Earth
          observation sources for illustrative purposes. Aerial footage by Taryn Elliott and
          So Kenobi via Pexels.
        </Typography>
      </Container>
    </Box>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Typography
      component={Link}
      href={href}
      variant="body2"
      sx={{ color: "#CBD5D1", textDecoration: "none", "&:hover": { color: "#fff" } }}
    >
      {children}
    </Typography>
  )
}
