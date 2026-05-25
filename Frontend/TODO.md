# TODO - Realtime Patient Queue Widget Redesign

- [ ] Step 1: Refactor `RealtimePatientQueueWidget.tsx` queue card UI into strict horizontal cards with token / patient / wait / status badge / priority indicator.
- [ ] Step 2: Implement consistent status badge styling:
  - [ ] Waiting = blue badge
  - [ ] Priority = red glowing badge (pulse)
  - [ ] Called = green badge
- [ ] Step 3: Upgrade realtime indicators:
  - [ ] Add clearer active/next pulse dot integration
  - [ ] Add live update motion (enter/exit + subtle glow sweep)
  - [ ] Replace/upgrade ETA updating timer effect with a more “operations dashboard” style.
- [ ] Step 4: Improve typography & hierarchy (token size, patient bolding, metadata size), plus header summary:
  - [ ] queue title + active summary cards
  - [ ] total waiting + priority count
  - [ ] current doctor status (from store if available; otherwise show simulated indicator).
- [ ] Step 5: Styling pass for premium healthcare dashboard look:
  - [ ] glassmorphism, subtle gradients, glowing borders, hover animations
  - [ ] add separators and spacing fixes.
- [ ] Step 6: Run lint/build/dev check and validate animations in browser.

