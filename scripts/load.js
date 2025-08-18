import http from "k6/http";
import { check, sleep } from "k6";

// Load test: gradual ramp-up, plateau, then ramp-down
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // ramp up to 10 VUs in 1 minute
    { duration: "2m", target: 30 }, // ramp up further to 30 VUs in 2 minutes
    { duration: "2m", target: 30 }, // stay at 30 VUs for 2 minutes
    { duration: "1m", target: 0 }, // ramp down to 0 VUs in 1 minute
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // less than 1% of requests should fail
    http_req_duration: ["p(95)<800"], // 95% of requests < 800ms
    "checks{type:ok}": ["rate>0.99"], // functional checks should pass >99%
  },
  tags: { project: "k6-portfolio" }, // metadata tag
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)"], // extra stats
};

// Use BASE_URL from environment variable or default
const BASE_URL = __ENV.BASE_URL || "https://test-api.k6.io";

export default function () {
  // Send GET request
  const res = http.get(`${BASE_URL}/public/crocodiles/1/`);

  // Functional checks
  check(
    res,
    {
      "status is 200": (r) => r.status === 200,
      "body has id=1": (r) => (r.json() || {}).id === 1,
    },
    { type: "ok" }
  );

  sleep(1); // wait 1s between iterations
}

// Save detailed summary to JSON file (for CI artifacts)
export function handleSummary(data) {
  return {
    "results/summary.json": JSON.stringify(data, null, 2),
  };
}
