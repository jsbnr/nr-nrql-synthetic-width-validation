# New Relic NRQL Synthetic with validation.

This script demonstrates how to perform a NRQL query to derive a result that can then be used to assert failure on the script. The user can provide their own validation function to apply to the result to fail or pass the script.

The value is also stored in a custom attribute `computedValue` for further analysis and charting.
 