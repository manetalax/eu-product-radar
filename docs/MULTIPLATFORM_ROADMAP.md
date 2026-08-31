# ImportVerifier multiplatform roadmap

## Principle
Keep one product core: Next.js web UI + server APIs + regulatory engine. Native shells must reuse the same product logic and authentication model rather than fork the business rules.

## Phase 1 — Web / PWA
- Responsive desktop, phone and iPad layouts.
- Web app manifest and service worker.
- Installable standalone experience where supported.
- Never cache authenticated API or auth responses.
- Camera/file inputs remain web-compatible.

## Phase 2 — iOS / iPadOS / Android
Preferred wrapper: Capacitor.

Native-only capabilities should live behind adapters:
- Camera/document scanner.
- Share sheet / "Open in ImportVerifier".
- Secure token storage.
- Push notifications for Regulatory Impact Radar.
- File-system import/export for PDF/XLSX reports.
- Deep links into product twins and alerts.

The regulatory engine, billing state and source-backed results stay server-side.

## Phase 3 — Windows / macOS / Linux
Preferred wrapper: Tauri.

Desktop-only capabilities:
- Drag/drop large local files.
- OS file associations.
- Native notifications.
- Local encrypted cache for non-sensitive UI state only.
- Auto-update/signing per platform.

Do not duplicate the regulatory engine into desktop binaries unless an offline product is explicitly designed later.

## API contract
Native clients should consume the same authenticated endpoints as the web application. Platform-specific integrations belong behind connector/adaptor interfaces, not inside UI components.

## Release gates
1. Web production acceptance passes.
2. Touch/camera/file workflows verified on iPhone/iPad/Android browsers.
3. PWA install behavior verified.
4. Mobile wrapper built only after auth, billing, import and reports are stable.
5. Desktop wrapper built after mobile adapter boundaries are proven.
