# Font Setup

The mobile app uses the same fonts as the web frontend. You need to download them manually before running the app.

## Required Fonts

| Font | Source | File Name |
|------|--------|-----------|
| Geist Regular | [Vercel Geist](https://vercel.com/font) | `Geist-Regular.ttf` |
| Geist Bold | [Vercel Geist](https://vercel.com/font) | `Geist-Bold.ttf` |
| Geist Mono | [Vercel Geist](https://vercel.com/font) | `GeistMono-Regular.ttf` |
| IBM Plex Arabic Regular | [Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic) | `IBMPlexArabic-Regular.ttf` |
| IBM Plex Arabic Bold | [Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic) | `IBMPlexArabic-Bold.ttf` |

## Setup

1. Download the fonts from the links above
2. Place the `.ttf` files in `assets/fonts/`
3. The fonts are already configured in `app.json` and will be loaded at startup

## Why These Fonts?

- **Geist** matches the web frontend's font family
- **IBM Plex Arabic** provides proper Arabic script rendering for RTL support
