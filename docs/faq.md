# FAQ

These answers describe the current static architecture.

???+ question "Does GitHub Pages need a database?"
    No. The app reads bundled JSON. Actions updates issuer holdings before deployment.

??? question "Can visitors upload holdings or add a source URL?"
    Not to shared storage. Maintainers edit the source configuration. See [Add ETFs](./adding-etfs.md).

??? question "Does CAD imply exchange-rate conversion?"
    No. CAD is the default display format. Enter every position in the same currency. Changing the displayed currency does not convert amounts.

??? question "Does a successful refresh mean every fund updated?"
    No. Individual issuer errors retain usable previous data. Check source errors and holdings dates, not only the command exit status.

??? question "Will adding all Vanguard ETFs give complete company-level exposure?"
    Not automatically. Some funds hold other ETFs, and the calculator does not recursively expand them. The issuer must provide look-through holdings, or that feature needs separate implementation.

??? question "Is a private repository's Pages site private?"
    Not necessarily. The current Pages site is public. Issuer JSON and documentation are published, while portfolio amounts remain in the browser.

??? question "Why are snapshot dates older than the last refresh?"
    Issuers publish holdings on their own schedule. The last refresh records when the download was attempted. The snapshot date records the issuer's holdings date.
