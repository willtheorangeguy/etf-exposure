# ETF Exposure — Known issues

This file records defects found during documentation. They remain unfixed and are excluded from the public site.

## A failed first snapshot write can leave an empty ETF in the catalog

- **Severity:** Medium
- **Where:** `src/lib/static-refresh.ts`, new-ETF creation before `storage.write`
- **What:** The refresh appends a new ETF before writing its first snapshot. A write error is caught as a source error, but the appended ETF remains with no snapshots.
- **Why it matters:** A later catalog write can persist that empty ETF. The artifact verifier expects a latest snapshot and can fail, blocking deployment despite other valid retained data.
- **Suggested fix:** Commit the ETF/catalog mutation only after storage succeeds, or roll it back on error. Add a failing-storage test before changing the refresh transaction boundary.
