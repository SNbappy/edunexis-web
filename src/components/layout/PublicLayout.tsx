import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import PublicNavbar from "./PublicNavbar"
import PublicFooter from "./PublicFooter"

// Theme handling is centralized in ThemeProvider, which forces light on
// public routes regardless of saved preference. No DOM mutation here.
//
// The brand intro loader was removed from here: it held the page for 2.4s on
// every refresh and delayed the hero film, which is the first thing a visitor
// should see. The component still exists at ./PublicLoader if it's wanted back.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <PublicNavbar />
      <main className="flex-1">
        {/*
          The fallback must reserve height, not collapse to nothing.
          Route components are lazy-loaded; with a null fallback this <main>
          has zero content while the chunk downloads, so `flex-1` pulls the
          footer up into an otherwise empty viewport — you see the footer
          flash, then get shoved down when the page arrives. A full-viewport
          placeholder keeps the footer below the fold until content lands.
        */}
        <Suspense fallback={<div aria-hidden className="min-h-screen" />}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}