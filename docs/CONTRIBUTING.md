# Contributing

A developer guide for working with the OdinEye codebase.

---

## Prerequisites

| Tool | Version | Required for |
|:-----|:--------|:------------|
| Node.js | 18+ | Running the project |
| npm | 9+ | Package management |
| Expo CLI | Latest | Dev server and builds |
| Android Studio | Latest | USB/ADB local builds (optional) |
| EAS CLI | Latest | Cloud builds (optional) |
| TypeScript | 6 | Type checking (installed via devDeps) |

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI globally (optional, for cloud builds)
npm install -g eas-cli
```

---

## Project setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd centralized-health-app

# 2. Install dependencies
npm install

# 3. Start the Metro bundler
npm start

# 4. Run on Android device (USB + ADB)
npx expo run:android
```

No environment variables or secrets are required to start — the app runs with local/mock data immediately.

---

## Project structure

```
src/
├── components/        # All UI components, grouped by feature domain
│   ├── ai/            # AI coach chat interface
│   ├── body/          # Body & muscle recovery analysis
│   ├── common/        # Shared components (modals, loaders, splash)
│   ├── home/          # Home tab (metric cards, top bar, wellness cards)
│   ├── medication/    # Meds tab (calendar, dose logging, modals)
│   ├── navigation/    # FloatingTabBar
│   ├── overview/      # Vitals tab
│   ├── settings/      # Config tab
│   └── sleep/         # Sleep bar chart
├── screens/
│   ├── DashboardScreen.tsx   # Root shell — global state + tab orchestration
│   └── OnboardingScreen.tsx  # First-run and goal recalibration
├── services/          # Business logic and external API clients
│   ├── ai/            # AI service, local coach engine, sports science KB
│   ├── api/           # Ultrahuman, Fitbit, Hevy API clients
│   ├── healthConnect/ # Android Health Connect integration
│   ├── live/          # Telemetry aggregator
│   ├── medication/    # Medication CRUD, reminder scheduling
│   ├── security/      # Crypto utilities
│   ├── sleep/         # Sleep history service
│   └── storage/       # Encrypted credentials vault
├── theme/
│   └── colors.ts      # Single source of truth for all colour values
└── types/             # TypeScript interfaces and types (barrel from index.ts)
```

**Where to add new features:**

- New **UI component** → `src/components/<domain>/`
- New **API integration** → `src/services/api/`, then wire into `liveHealthService`
- New **screen** → `src/screens/`
- New **type / interface** → `src/types/<domain>.ts`, exported from `src/types/index.ts`

---

## Design conventions

OdinEye uses the **Scandinavian Pastel Bento** design language. All colours are defined in `src/theme/colors.ts` — **never use raw hex strings in components**.

### Colour palette

| Token | Hex | Usage |
|:------|:----|:------|
| `Colors.surface` | `#FFFFFF` | Cards, modals, floating elements |
| `Colors.background` | `#F8FAFA` | App background |
| `Colors.bentoMint` | `#CCE6DE` | Primary accent cards (hero mint) |
| `Colors.bentoMintLight` | `#EAF2EE` | Secondary mint (icon bubbles, tags, borders) |
| `Colors.bentoMintDark` | `#1F382E` | Active states, primary text on mint |
| `Colors.bentoPeach` | `#FCE7DC` | Warm accent elements |
| `Colors.bentoPeachLight` | `#FAF5EE` | Peach card backgrounds |
| `Colors.textPrimary` | `#141816` | Primary body text |
| `Colors.textSecondary` | `#63706B` | Subtitles and metadata |
| `Colors.textMuted` | `#94A39D` | Placeholders, disabled state |

### Icon rule

**No raw emoji characters in UI components.** Every icon in OdinEye is a bespoke inline SVG using `react-native-svg`:

```tsx
import Svg, { Path, Circle } from 'react-native-svg';

// ✅ Correct
<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
  <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={Colors.bentoMintDark} strokeWidth="2" />
</Svg>

// ❌ Wrong
<Text>🏃</Text>
```

### StyleSheet convention

Each component owns its `StyleSheet.create({})` at the bottom of the file. Do not use inline style objects for anything other than dynamic values (e.g. `style={{ backgroundColor: color }}`).

---

## TypeScript conventions

- **Strict mode is on** — `tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`
- **Interfaces in `src/types/`** — shared interfaces (props, data shapes, service responses) go in the appropriate file under `src/types/` and are re-exported from `src/types/index.ts`
- **Component-local prop types** — simple prop types can be defined inline in the component file
- **No `any`** — if you must escape the type system, use `unknown` and narrow it

```ts
// ✅ Correct — typed interface
export interface SavedCredentials {
  ultrahumanToken?: string;
  fitbitToken?: string;
  bodyAnalysisEnabled?: boolean;
}

// ❌ Wrong — avoid any
const creds: any = await loadCredentials();
```

---

## Adding a new data source

Follow these steps to add a new wearable or API integration:

### 1. Create the API client

```ts
// src/services/api/myDeviceApiClient.ts
class MyDeviceApiClient {
  private static instance: MyDeviceApiClient;
  public static getInstance() { ... }

  async fetchLatest(token: string): Promise<MyDeviceData> { ... }
}

export const myDeviceClient = MyDeviceApiClient.getInstance();
```

### 2. Add credentials to the storage type

```ts
// src/types/storage.ts
export interface SavedCredentials {
  // ... existing fields
  myDeviceToken?: string;         // ← add this
  myDeviceEnabled?: boolean;      // ← and this
}
```

### 3. Add the default to the credentials cache

```ts
// src/services/storage/credentialsStorage.ts
const memoryCache: SavedCredentials = {
  // ... existing defaults
  myDeviceEnabled: false,         // ← add default
};
```

### 4. Wire into `liveHealthService`

```ts
// src/services/live/liveHealthService.ts
// In syncAll(), add your source:
if (this.enabledSources.myDevice) {
  const data = await myDeviceClient.fetchLatest(creds.myDeviceToken!);
  // merge into the health data object
}
```

### 5. Add the Config UI card

In `src/components/settings/SettingsView.tsx`, add a new wearable card in **Category 02** following the same pattern as Ultrahuman / Fitbit / Hevy — toggle, token input with eye visibility, Save & Test button.

---

## Adding a new medication form

If adding a new medication delivery form (e.g. patch, spray):

### 1. Extend the type

```ts
// src/types/medication.ts
export type MedicationForm =
  | 'capsule' | 'tablet' | 'drops' | 'liquid' | 'injection'
  | 'patch';   // ← add here
```

### 2. Add the icon

```tsx
// src/components/medication/MedicationIcons.tsx
export const PatchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = '#2C4A3E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="..." stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
```

### 3. Add a case to every `renderIcon` / `renderMedIcon` switch

Files to update:
- `src/components/medication/MedicationSectionView.tsx` — `renderMedIcon()`
- `src/components/medication/MedicationDetailModal.tsx` — `renderFormIcon()`
- `src/components/medication/MedicationReminderAlertModal.tsx` — `renderIcon()`
- `src/components/medication/AddMedicationModal.tsx` — form picker list

---

## Running checks

**Always run these before committing or opening a PR:**

```bash
# TypeScript type check — must exit with code 0
npx tsc --noEmit

# Android Metro bundle integrity check
EXPO_NO_TELEMETRY=1 npx expo export --platform android --no-bytecode && rm -rf dist
```

A JSX syntax quick-check (faster than full tsc) using Babel:

```bash
node -e "
  const b = require('@babel/parser');
  b.parse(require('fs').readFileSync('src/components/settings/SettingsView.tsx', 'utf8'), {
    sourceType: 'module', plugins: ['typescript', 'jsx']
  });
  console.log('JSX OK');
"
```

---

## Build & deploy

See **[BUILD.md](BUILD.md)** for the complete guide. Quick reference:

```bash
# Local USB build
npx expo run:android

# EAS cloud preview APK
eas build --platform android --profile preview

# EAS production build
eas build --platform android --profile production
```

---

## Code style rules

| Rule | Detail |
|:-----|:-------|
| No `console.log` in components | Use `console.warn` in services only; never in UI components |
| No TODOs in commits | Resolve or create a tracked issue before merging |
| No raw hex in components | Always `Colors.tokenName` from `src/theme/colors.ts` |
| No emoji in JSX | Use SVG icons exclusively |
| No Redux / Zustand | State lives in `DashboardScreen` + singleton services |
| Interfaces in `src/types/` | Shared interfaces belong in the types barrel, not component files |
| `StyleSheet` at bottom | Every component file ends with its `StyleSheet.create({})` block |
| Guard async service calls | Wrap service calls in try/catch; log with `console.warn` |
