# CLAUDE.md — Project Intelligence

## Commands

```bash
npm run dev          # Dev server → http://localhost:3000
npm run test:run     # All tests, single run (144 tests, 5 files)
npm test             # Watch mode
npm run build        # Production build (also runs TypeScript checks)
```

## Architecture

Four modules with strict one-way dependencies: `rules/ → holidays/ → engine/ → app/`.

- **rules/** — Deadline rules as versioned structured data. Adding a rule = adding a data entry to `v1.ts`, never changing engine logic.
- **holidays/** — Static NC judicial holiday dates by year. No computed holidays — each year is manually verified against nccourts.gov.
- **engine/** — Pure function `computeDeadline(ComputeInput): ComputeOutput`. No UI, no network, no side effects.
- **app/** — Next.js App Router UI. Client components only. Two-state machine: input → result.

## Adding a New Deadline Rule

1. Add a `DeadlineRule` entry to `src/rules/v1.ts`
2. Add hand-verified golden tests to `src/engine/__tests__/golden.test.ts` with documented day-counting in comments
3. The UI picks it up automatically — no UI changes needed
4. If the rule excludes Rule 27(b) mail/email days, set `serviceAddDays: 0` (see Notice of Appeal pattern)

## Adding a New Holiday Year

1. Verify dates at https://www.nccourts.gov/holiday-schedule
2. Add a year entry to `NC_HOLIDAYS` in `src/holidays/nc-holidays.ts`
3. Add tests in `src/holidays/__tests__/holidays.test.ts`
4. Update the `isYearSupported` test expectations if needed

## Date Handling

All date arithmetic uses the noon-local-time pattern: `new Date(y, m-1, d, 12, 0, 0)`. This avoids DST boundary bugs. Never use `new Date("2026-04-06")` — it parses as UTC midnight and can shift days in local time.

ISO strings (`"2026-04-06"`) are the internal format everywhere. Formatted dates are only for display.

## Testing Conventions

- **Golden tests** are the correctness contract. Each has a comment showing the exact day-by-day count so anyone can verify with a calendar.
- Rule pack version is checked in tests — bump `golden.test.ts` version assertions when updating `v1.ts`.
- The `isYearSupported` test uses an unsupported year (currently 2028). If you add that year's holidays, update the test to use a further-out year.

## Key Gotchas

- **Rule 3(c) Notice of Appeal**: Rule 27(b) +3 mail/email days explicitly does NOT apply. The engine has a three-branch conditional for this — don't simplify to two branches.
- **2027 holidays are PROVISIONAL**: Computed from standard rules, not yet officially published by NC Judicial Branch. Code comments flag this.
- **Tailwind CSS v4**: Uses `@theme inline` in `globals.css`, not `tailwind.config.ts`. Custom colors (navy-*, gold-*) are defined there.
- **No external dependencies** for dates or ICS generation. Keep it that way — auditable simplicity matters for a legal tool.

## Git

- Repo: `klinerj/nc-appellate-calc` on GitHub
- Auto-deploys to Vercel on push to main
- Commit style: conventional commits (`feat`, `fix`, `test`, `chore`, `docs`)
- Owner: Rob Kline (klinerj@gmail.com)

## Legal Context

This calculates filing deadlines under the NC Rules of Appellate Procedure. The rules were verified against codification dated September 2, 2025. Key computation rules:
- **Rule 27(a)**: Exclude trigger day. Roll forward past weekends/holidays.
- **Rule 27(b)**: +3 calendar days for mail/email service (but some rules explicitly exclude this).
