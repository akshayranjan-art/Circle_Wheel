# Orbit App Picker and Phone Installation

## Goal

Make each empty orbit position open an app picker, place the chosen shortcut into that exact slot, and let users add Orbit to their phone home screen.

## Build

- Track the tapped empty orbit position and preserve that position when adding an app.
- Open a polished picker with built-in apps, searchable presets, and a Custom App option.
- Prevent duplicate built-in shortcuts where practical; allow custom names, icons, and safe web/app deep links.
- Add manifest-only phone installation with Orbit branding, app icons, standalone display, and mobile theme metadata.
- Add an Install control that uses the browser install prompt when available and shows platform-appropriate Add to Home Screen guidance otherwise.
- Keep the current 40-position orbit, inertia gestures, edge rail, search, liquid-glass look, and local persistence.

## Platform boundary

- The installed web app can open saved links and supported deep links.
- Replacing the phone’s default launcher, listing every installed app, drawing over other apps, and controlling native system features require a separately packaged Android launcher with explicit operating-system permissions. This web build will not claim or simulate those permissions.

## Verification

- Confirm multiple empty “+” positions open the picker and selected apps land in the tapped positions.
- Confirm custom app creation still supports name, link, emoji, and uploaded icon.
- Confirm manifest, icons, install metadata, launcher search, and drag behavior work without browser errors.