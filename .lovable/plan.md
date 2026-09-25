# Mega Launcher and Ludo Expansion

## Goal

Turn the current local demo into a mobile-first launcher and feature-rich Ludo experience, using the uploaded screenshots only as visual references.

## 1. Curved edge launcher

- Replace the current full-circle wheel with a right-edge curved launcher and optional independent left edge.
- Support 40 shortcuts per edge, live search, A–Z quick jump, add/remove/edit, drag reorder, and smooth pointer/touch inertia.
- Add swipe-up app drawer and quick tools.
- Add wallpaper presets plus local image upload, with safe mobile sizing and notch/gesture-area spacing.
- Add launcher pack states for Free, ₹99/month, ₹599/year, and ₹1999 Lifetime; dual edge and exclusive themes follow entitlement state.
- Keep custom web shortcuts persistent and unify the two existing app-list systems into one source of truth.

## 2. Ludo engine and match integrity

- Refactor game rules into a deterministic match reducer covering legal moves, turns, captures, portals, ghost turns, sudden death, time warp, dice skins/modifiers, reconnect snapshots, and temporary bot takeover.
- Preserve the +11 diamond capture reward and make every reward/spend a clear ledger entry.
- Add server-validated rolls, moves, stakes, rewards, insurance, bounties, loss streak rewards, challenge stars, simulated diamond market, and jackpot milestones.
- Keep diamonds as virtual game credits with no withdrawal or cash conversion.
- Add responsible-play controls that use full ledger history rather than the current capped 40-entry list.

## 3. 4D neon-liquid game presentation

- Rebuild the Ludo board presentation with layered depth, holographic dice, liquid buttons, springy tokens, capture kill-cam, victory shockwaves, sound-reactive borders, arena weather, and reduced-motion fallbacks.
- Add optimized particle pools for Cyber Dragon, Phantom Hypercar, Galactic Ship, and bike arrivals, plus high-value gift storms.
- Add synthesized game audio after the first user gesture, with mute and intensity controls.
- Use a mobile performance mode so effects scale down automatically; target smooth play rather than claiming guaranteed 120 FPS on every phone.

## 4. Rooms and social

- Build room discovery and an 8-seat cyber lounge with 4 player and 4 VIP spectator seats.
- Add animated fingerprint/face lock presentation, host seat controls, spatial-position indicators, voice-filter controls, room chat, private seat whispers, friends, swipe matchmaking cards, clans, rosters, and clan perks.
- Connect gifts to recipients and room-wide effects; 5999/9999 gifts trigger thunderstorm and diamond-rain visuals.
- Real text chat, presence, seats, friends, rooms, and match state use Lovable Cloud.
- Voice and streaming controls will be feature-complete UI in this release; real microphone transport/live video requires a separate supported media provider and cannot be honestly simulated as secure live audio.

## 5. Progression, rankings, tournaments and profile

- Replace fabricated leaderboard rows with stored daily, weekly, monthly, wealth, highest-spin, and tournament rankings.
- Add trophy wall, captured-opponent history, loser history, evolving token skins, dances, badges, gift collection, and Emperor Crown progression.
- Add scheduled knockout brackets, entry tickets, standings, prize settlement, spectator count, tips, and match-resume status.

## 6. Moderation and fair play

- Add reports, room mute/kick/ban actions, room monitoring, and audit history with server-side role checks.
- Store admin/moderator roles separately and protect every privileged action.
- Add practical anomaly alerts for impossible moves, duplicate rewards, repeated coordinated transfers, and suspicious repeated opponents.
- Clearly label the limitation: client-hosted casual multiplayer cannot provide casino-grade or fully server-authoritative anti-cheat guarantees.

## 7. Data, accounts and payments

- Enable Lovable Cloud, add sign-in, persistent profiles, wallets, ledger, rooms, friendships, messages, matches, rankings, clans, reports, entitlements, and tournaments with row-level access controls.
- Move current local wallet/profile data behind typed data hooks and migrate safely from device storage after sign-in.
- Before real subscriptions, run payment eligibility and request the required provider confirmation; payment activation is a separate gated step.
- Keep a demo entitlement path until real payments are approved and enabled.

## 8. Verification

- Verify launcher search, A–Z jump, reordering, both edge wheels, wallpaper upload, and swipe drawer on mobile and desktop.
- Verify Ludo rules, +11 capture ledger, modes, reconnect, limits, rewards, and reduced-motion behavior.
- Verify room/chat/match state with two signed-in browser sessions.
- Verify moderation permissions, payment gating, metadata, runtime logs, and responsive screenshots before completion.

## Technical notes

- Keep TanStack Start routes and semantic theme tokens.
- Use turn-based database updates for Ludo instead of high-frequency broadcasts.
- Use realtime presence/chat only where needed and keep rooms capped at eight.
- Split the current large route files into focused launcher, game, room, economy, and moderation modules.
