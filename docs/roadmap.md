# Limitations

The current implementation has deliberate boundaries. This page does not promise unimplemented features or delivery dates.

## Catalog coverage

The initial catalog contains VCN, ZCN, and XEQT. Remaining Vanguard Canada funds require verified product links and per-fund checks. [Expand Vanguard coverage](./vanguard-expansion.md) defines that work.

HTML discovery follows static anchors within limits. It does not guarantee all funds on every issuer's site. PDF parsing and JavaScript-browser crawling are not implemented.

## Look-through accuracy

The calculator applies reported holding weights. It does not recursively expand ETF holdings. It does not convert currencies or repair incomplete tables by scaling them to 100%.

Bond funds report bonds or identifiers, not necessarily company stocks. Negative/zero weights are not stored by the parser. Leveraged, derivative-heavy, or incomplete source tables need careful review before treating results as complete portfolio exposure.

## Freshness and access

Monthly Actions runs depend on GitHub scheduling and issuer availability. Holding dates can lag behind refresh dates. API format changes can require an adapter update.

Visitors cannot write to a shared upload database. Source maintenance is a repository workflow.

## Documentation boundary

The former database volumes are not deleted by the migration. Existing historical data outside the JSON catalog still needs an explicit export before retirement. Test artifact checks do not replace interactive browser testing.
