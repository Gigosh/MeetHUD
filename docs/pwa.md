# PWA Notes for MeetHUD

## PWA Status

The app is configured for PWA installability with the following:

### ✅ Complete
- `viewport-fit=cover` added for iOS safe area handling
- `100dvh` height for proper mobile PWA viewport
- Safe area insets on header and bottom sheets
- SVG PWA icons created (PNG icons needed for iOS)
- Manifest configured with proper icons
- Bottom sheet drawer for agenda on mobile

### ⚠️ Requires Action

#### PNG Icons
The manifest references `icon-192.png` and `icon-512.png` for maskable icons (required for iOS App Store-style PWA installation). To generate these:

```bash
# Install sharp
npm install sharp

# Run the icon generation script
node scripts/generate-pwa-icons.mjs

# Or add to prebuild
npm run prebuild
```

The SVG source files are at `public/icon-192.svg` and `public/icon-512.svg`.

#### Service Worker / Offline Support

For Vercel deployment, there are two options:

**Option 1: Vercel Built-in Caching (Recommended)**
Vercel's CDN automatically caches static assets. For offline support, add:

```js
// src/app/layout.js or layout.tsx
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour
```

For full offline support with service worker, use `@vercel/static` or next-pwa:

```bash
npm install @ducanh2912/next-pwa
```

Then create `next.config.js` with PWA plugin.

**Option 2: Manual Service Worker**
Create `public/sw.js` and register in layout:

```js
// In RootLayout
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

For Vercel, the recommended approach is Option 1 with static generation and Vercel's edge caching.

### 📱 Testing PWA Install

1. Build the app: `npm run build`
2. Deploy to Vercel
3. Open on mobile Safari/Chrome
4. Use "Add to Home Screen" option in browser menu

### 🔧 Notes

- The app uses Supabase for auth/data - offline mode will require additional caching logic for production use
- For full offline-first architecture, consider adding IndexedDB for local data persistence
