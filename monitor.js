/**
 * Feel free to explore, or check out the full documentation
 * https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-api-tests
 * for details.
 * 
 * This script demonstrates how to perform a NRQL query to derive a result that can then be used to assert failure on the script.
 * The value is also stored in a custom attribute `computedValue` for further analysis and charting.
 */

const REGION = "US"; // US or EU
const ACCOUNT = $env.ACCOUNT_ID; //your account ID
const USER_API_KEY = $secure.USER_API_KEY; // Replace this with a secure credential in your account holding a User API key.

// Ensure you return a single column field called "value"
const QUERY = `SELECT count(*) as value FROM Log where message like '%someEventImLookingFor%' since 1 hour ago`

//configure your own validation function using the query result
const VALIDATION_FN = (value) => {
    assert.ok(value!==0,`Validation failed, expecting a non zero value got: ${value}`);
}


//No need to change anything after here! -----

var assert = require('assert');
const API_URL = REGION == "EU" ? "https://api.eu.newrelic.com/graphql" : "https://api.newrelic.com/graphql";

const GQL = `{
  actor {  
    account(id: ${ACCOUNT}) {
      nrql(query: "${QUERY}") {
        results
      }
    }
  }
}`;

$http.post(API_URL, 
  {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': USER_API_KEY
    },
    json: {
      query: GQL
    }
  }
,
   // Callback
   function (err, response, body) {
      assert.ok(!err, "Connection error!")
      assert.equal(response.statusCode, 200, 'Expected a 200 OK response');
      const results = body?.data?.actor?.account?.nrql?.results;
      if (Array.isArray(results) && results.length === 1 && results[0].hasOwnProperty('value')) {
        const value = results[0].value;
        $util.insights.set("computedValue", value); //store value as csutom attribute
        console.log("Computed value: ", value);
        VALIDATION_FN(value); //perform custom validation
      } else {
        console.error(JSON.stringify(body));
        assert.fail("No single 'value' column result found in result set, check your query returns a 'value' column.");
      }
   }
 );