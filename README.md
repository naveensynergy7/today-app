# Today

**One list. This day. Nothing else.**

---

Most task apps want to own your whole life: projects, labels, due dates, someday lists. **Today** does the opposite. It asks a single question: *What matters right now?*

You add a few tasks. You finish what you can. Whatever’s left doesn’t vanish—it rolls into tomorrow, so you can stop carrying it in your head. Over time, a calendar and a few stats show you that you’re actually moving. No accounts, no sync, no clutter. Just today, and the gentle nudge to keep going.

---

## Why Today?

- **Focus** — One list for today. No folders, no priority levels. If it’s on the list, it matters.
- **Grace** — Incomplete tasks roll over to the next day. You decide what stays; the app doesn’t judge.
- **Clarity** — A calendar and simple analytics show completion over time, so progress is visible, not imagined.
- **Quiet** — Optional reminders (first incomplete task + a short quote) keep you on track without noise. Turn them off anytime.
- **Yours** — Everything lives on your device. No sign‑in, no cloud. Your list stays private.

---

## What’s inside

| Screen | Purpose |
|--------|--------|
| **Today** | Your list for the day: add, complete, reorder. Unfinished tasks move to tomorrow automatically. |
| **Calendar** | Month view with completion dots; tap a day to see its tasks and how much you got done. |
| **Analytics** | Completion stats for today, this month, and all time—so you can see the trend. |
| **Settings** | Toggle reminders on or off. |

First time you open the app, a short onboarding explains the idea; you can skip it and dive straight in.

---

## Tech

- **Expo** (SDK 55) + **React Native** — cross‑platform iOS & Android
- **expo-sqlite** — local task storage (no server)
- **expo-notifications** — optional reminders + motivational quotes
- **React Navigation** — bottom tabs (Today, Calendar, Analytics, Settings)
- **react-native-draggable-flatlist** — reorder today’s tasks
- **react-native-calendars** — calendar UI

---

## Project layout

```
today/
├── App.js                 # Entry: fonts, splash, onboarding, tab navigator
├── app.json               # Expo config (icon, plugins)
├── assets/                # App icon and assets
├── src/
│   ├── db/database.js     # SQLite: tasks, rollover, completion stats
│   ├── notifications/    # Reminders and quotes
│   ├── screens/          # Today, Calendar, Analytics, Settings, Onboarding
│   └── theme.js          # Design tokens (colors, spacing, typography)
├── ios/                   # Native iOS (from prebuild)
├── android/               # Native Android (from prebuild)
└── AppIcons/              # Optional multi-resolution app icon set
```

---

## Get started

**Prerequisites:** Node.js (LTS), and for native builds — Xcode/CocoaPods (iOS) or Android Studio (Android).

```bash
git clone <repo-url>
cd today
npm install
```

**Run in Expo Go (quick dev):**

```bash
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS).

**Run as a standalone app (your icon, no Expo Go):**

```bash
npx expo run:ios      # or
npx expo run:android
```

To regenerate native projects after changing `app.json`:

```bash
npx expo prebuild --clean
npx expo run:ios      # or run:android
```

| Command | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Build and run on iOS |
| `npm run android` | Build and run on Android |
| `npm run web` | Start for web |

---

## Data & privacy

- **Storage** — All tasks live in a local SQLite database on the device. No account, no cloud.
- **Notifications** — The app may ask for notification permission to schedule reminders. You can disable reminders in **Settings** at any time.

---

## App icon

The launcher icon is set in `app.json` and `assets/icon.png`. The `AppIcons/` folder holds an optional multi-resolution set; you can sync from there if you use that set for iOS.

---

*Today is for people who want to do today well—and leave the rest for tomorrow.*
