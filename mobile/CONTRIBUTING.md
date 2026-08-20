# Deen Bridge Mobile

React Native (Expo) mobile app for Deen Bridge — authentic Islamic education on iOS and Android.

## Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- **iOS**: Xcode 15+ (Mac only) + CocoaPods
- **Android**: Android Studio + Android SDK 34+

## Setup

```bash
cd dnb-frontend/mobile
npm install

# Download fonts (see assets/fonts/README.md)
# Then place .ttf files in assets/fonts/

# Start development
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or run on a simulator:
- iOS: `npx expo start --ios`
- Android: `npx expo start --android`

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_AI_API_URL=http://localhost:8000
EXPO_PUBLIC_STELLAR_NETWORK=testnet
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Architecture

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout — providers, fonts, splash
│   ├── (auth)/             # Auth group — login, signup
│   ├── (tabs)/             # Tab navigator — home, courses, library, profile
│   └── +not-found.tsx      # 404 screen
├── components/
│   ├── atoms/              # Primitives — Button, Input, Badge, Avatar
│   ├── molecules/          # Composed — CourseCard, SearchBar, EmptyState
│   ├── organisms/          # Complex — CourseList
│   └── ui/                 # Layout — ScreenWrapper, LoadingScreen
├── lib/
│   ├── api/                # Axios client + endpoint constants
│   ├── auth/               # AuthContext (Firebase + JWT)
│   ├── config/             # env.ts, theme.ts
│   ├── hooks/              # useTheme, useAuth
│   └── utils/              # storage, format helpers
├── constants/              # Colors, spacing, typography tokens
├── types/                  # TypeScript interfaces
├── i18n/                   # English + Arabic translations
└── assets/                 # Fonts, images
```

### Key Patterns

| Concern | Approach |
|---------|----------|
| Navigation | Expo Router v4 (file-based, typed routes) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| State | React Context (Auth, Theme) |
| API | Axios with JWT interceptor + token refresh |
| i18n | i18next + react-i18next, RTL via I18nManager |
| Auth | Firebase Auth + backend JWT via SecureStore |
| Types | Shared interfaces in `types/index.ts` |

## Adding a New Screen

1. Create the file in `app/` under the appropriate group:
   - Auth screens: `app/(auth)/your-screen.tsx`
   - Tab screens: `app/(tabs)/your-tab.tsx`
   - Detail screens: `app/your-screen.tsx`

2. Add navigation entry if needed in the parent `_layout.tsx`

3. Use existing atoms/molecules for UI:
   ```tsx
   import { Button, Input, Badge } from "@/components";
   import { ScreenWrapper } from "@/components/ui";
   ```

4. Add translations to `i18n/en.json` and `i18n/ar.json`

## Adding a New Component

Follow the atomic design hierarchy:

- **Atom**: Single-purpose primitive (Button, Input, Badge)
- **Molecule**: Small composition of atoms (CourseCard, SearchBar)
- **Organism**: Complex feature component (CourseList, DashboardHeader)

```tsx
// components/atoms/YourComponent.tsx
import { View, Text } from "react-native";

interface YourComponentProps {
  title: string;
}

export function YourComponent({ title }: YourComponentProps) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

## Adding a New Hook

Create in `lib/hooks/`:

```tsx
// lib/hooks/useYourHook.ts
import { useState, useEffect } from "react";

export function useYourHook() {
  const [data, setData] = useState(null);
  // ...
  return { data };
}
```

## Coding Conventions

- **TypeScript** everywhere — no `.js` files
- **Named exports** for components and functions
- **Path aliases**: Use `@/` for imports (e.g., `@/components/atoms/Button`)
- **Functional components** only — no class components
- **NativeWind** for styling — prefer `className` over `style` when possible
- **i18n** for all user-facing text — never hardcode strings
- **RTL-aware** — use `flexDirection` logic, test in Arabic mode

## Building

### Development
```bash
npx expo start
```

### Preview (internal testing)
```bash
npx eas build --profile preview --platform ios
npx eas build --profile preview --platform android
```

### Production
```bash
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

## Testing

```bash
npx expo start          # Test on device/simulator
npx expo start --ios    # iOS simulator only
npx expo start --android # Android emulator only
```

Test RTL by switching device language to Arabic.

## Contributing

1. Pick an issue from the `mobile` label
2. Create a branch: `feat/your-feature` or `fix/your-fix`
3. Follow the coding conventions above
4. Test on both iOS and Android
5. Submit a PR targeting `dev` branch

### Issue Labels

- `mobile` — Mobile app issues
- `mobile:screen` — New screen implementations
- `mobile:component` — New or updated components
- `mobile:feature` — Feature integration (Stellar, Jitsi, etc.)
- `mobile:bug` — Mobile-specific bugs

## Useful Links

- [Expo Docs](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [NativeWind](https://www.nativewind.dev)
- [React Navigation](https://reactnavigation.org)
- [Firebase React Native](https://rnfirebase.io)
