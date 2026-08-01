# Solar Calculator Porting Notes

The React calculator is now the source of truth.

Clean production routes:

- `/services/solar/calculator`
- `/services/solar/admin`

Compatibility redirects:

- `/services/solar/calculator-native`
- `/services/solar/admin-native`

Maintenance order:

1. Keep product catalogue changes behind authenticated admin APIs.
2. Keep load, inverter, battery, PV, protection, and quote calculations in the shared solar engine.
3. Add regression tests against known scenarios before changing recommendation logic.
4. Remove compatibility redirects after external links have been updated.

Parity scenarios are defined in `parityScenarios.ts`.
