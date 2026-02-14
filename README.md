# NC Appellate Deadline Calculator

A stateless, mobile-friendly web app that calculates filing deadlines under the North Carolina Rules of Appellate Procedure, with full audit trails and legal citations.

> **This tool is for informational purposes only and does not constitute legal advice. Always verify computed deadlines independently against the official rules and judicial holiday schedule.**

## What It Does

Enter a service date and service method, and the calculator computes when the responsive brief is due — showing every step of the computation with the authorizing rule citation.

**v0.1 implements one rule:**

| Trigger | Result | Days | Citation | Mail/Email Rule |
|---------|--------|------|----------|-----------------|
| Appellant's Brief served | Appellee's Brief due | 30 | Rule 13(a)(1) | +3 days (Rule 27(b)) |

**Time computation rules applied:**
- **Rule 27(a):** Exclude the trigger day. If the last day falls on a Saturday, Sunday, or judicial holiday, extend to the next business day.
- **Rule 27(b):** When service is by mail or email, add 3 calendar days before applying the weekend/holiday roll-forward.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running Tests

```bash
npm test          # Watch mode
npm run test:run  # Single run (CI)
```

63 tests across three modules: rules schema validation, holiday/weekend detection, and hand-verified golden deadline calculations.

## Architecture

Four independent modules communicating through typed interfaces:

```
src/
  engine/          # Pure deadline computation (no UI, no network)
    compute.ts     # computeDeadline() — the core function
    types.ts       # ComputeInput, ComputeOutput, ComputeStep
    __tests__/     # Golden tests (hand-verified expected dates)

  rules/           # Deadline rules as versioned structured data
    schema.ts      # RulePack, DeadlineRule type definitions
    v1.ts          # v0.1 rule pack (one rule, verified)
    __tests__/     # Schema validation tests

  holidays/        # NC Judicial Branch holiday data
    nc-holidays.ts # 2026 holiday dates (static dataset)
    holidays.ts    # Weekend/holiday detection, roll-forward logic
    __tests__/     # Holiday edge case tests

  app/             # Next.js App Router (UI only)
    page.tsx       # Single-page calculator (input → result state machine)
    components/    # CalculatorForm, ResultBanner, AuditTrail, etc.
    utils/         # ICS generation, clipboard
```

**Key design decisions:**
- **Rules are data, not logic.** The engine reads structured rule packs. Adding future deadline types means adding data entries, not rewriting code.
- **Zero production dependencies** beyond Next.js/React. Date arithmetic and ICS generation use simple custom helpers with no external libraries.
- **Every calculation shows its work.** The audit trail is the core value proposition — each step cites the authorizing rule.

## Updating Holiday Data

Holiday data lives in `src/holidays/nc-holidays.ts`. To add a new year:

1. Check the official schedule at https://www.nccourts.gov/holiday-schedule
2. Add a new entry to the `NC_HOLIDAYS` record with ISO date strings
3. Run `npm run test:run` to verify nothing broke

The engine automatically warns users when computing deadlines in years without verified holiday data.

## Adding New Rules

To add a new deadline rule (e.g., Reply Brief):

1. Add a new `DeadlineRule` entry to `src/rules/v1.ts`
2. Add golden tests to `src/engine/__tests__/golden.test.ts` with hand-verified expected dates
3. The UI automatically picks up new rules in the trigger document dropdown

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments on push.

## Official Sources

| Resource | URL |
|----------|-----|
| NC Rules of Appellate Procedure | https://www.nccourts.gov/courts/supreme-court/court-rules/north-carolina-rules-of-appellate-procedure |
| NC Judicial Branch Holiday Schedule | https://www.nccourts.gov/holiday-schedule |
| NC Court Closings & Advisories | https://www.nccourts.gov/closings |

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Vitest + React Testing Library
- Deployed on Vercel (free tier)

## License

Private — not open source.
