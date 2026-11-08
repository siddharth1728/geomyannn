# GEORYNTH — NATIVE MOBILE AUDIT & STATUS REPORT

**Product:** GEORYNTH  
**Date:** November 8, 2026  
**Auditor:** Mobile & Cross-Platform Systems Architect  
**Status:** **DECOMMISSIONED BY DESIGN (WEB-FIRST ARCHITECTURE)**

---

## 1. Repository Inspection Findings

- **Directory Existence:** `apps/mobile` does **NOT** exist in the repository (`Test-Path apps/mobile => False`).
- **Git Commit History:** In commit `4d3206e` (*"feat: complete web redesign with adaptive theme and remove mobile app"*), the native mobile subproject was explicitly removed per product owner directive:
  > *"Keep one thing in mind: this is not an app. This is a website. If unnecessary information is given in this prompt, remove it, and also remove the unnecessary files which are created inside this."*
- **Build Configurations:** `tsconfig.json` has removed the `apps/mobile` exclusion since no native files remain.

---

## 2. Mobile Device Experience via Web

Mobile users (iOS Safari and Android Chrome) access GEORYNTH via its fully responsive, map-first web application:

1. **Viewport Adaptation:** The CSS viewport scales fluidly from 360px up to 4K displays (`width=device-width, initial-scale=1.0`).
2. **Touch Interactions:** MapLibre GL handles native touch gestures: pinch-to-zoom, two-finger rotate/pitch, and tap-to-select markers.
3. **Mobile Dock Experience:** On screens under 768px, the navigation and meetup dock renders as a full-width collapsible drawer, allowing users to toggle between full-screen vector map view and place details.
4. **WhatsApp Deep Linking:** Social sharing buttons on mobile trigger native `whatsapp://` or `https://api.whatsapp.com/send` schemes to open group chats instantly.

---

## 3. Native App Store Readiness Verdict

- **iOS App Store Release:** **NOT READY / NOT SCOPED**. There is currently no active Xcode project, CocoaPods configuration, or EAS pipeline.
- **Google Play Store Release:** **NOT READY / NOT SCOPED**. There is currently no Android Gradle project or APK/AAB bundle.
- **Recommendation for Future Native Roadmap:** If a native mobile application is commissioned in a future phase, it should be built as an Expo Managed Workflow application consuming the existing `@georynth/domain` packages and Next.js backend API routes.
