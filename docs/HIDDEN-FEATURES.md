# Hidden Features

Features temporarily hidden from the prototype. Use this file to restore them.

---

## Action Bar

**Status:** Hidden  
**Hidden on:** 2026-04-07  
**Reason:** Temporarily hidden per design review.

### What it contains

- Primary action button (persona-aware: "Check Appeal SLA" / "Schedule Referral" / "Renew Credential")
- Secondary action button (persona-aware: "Create Case" / "Order Labs" / "Resolve Case")
- Feedback widget (thumbs up / thumbs down + dropdown)

### How to restore

1. **JS** — In `prototype/src/modules/page/ahis/ahis.js`, change `showActionBar = false;` to `showActionBar = true;`
2. **HTML** — No changes needed; it's already wrapped in `<template lwc:if={showActionBar}>`.

### Related getters (still in JS, untouched)

- `primaryActionLabel` — returns persona-aware label
- `primaryActionIcon` — returns persona-aware icon
- `secondaryActionLabel` — returns persona-aware label
