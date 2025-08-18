import http from "k6/http";
import { check, sleep } from "k6";

// Smoke test: short and light test to verify the API is alive and functional
export const options = {
  vus: 1, // 1 virtual user
  duration: "30s", // run for 30 seconds
  thresholds: {
    http_req_failed: ["rate<0.01"], // less than 1% requests should fail
    http_req_duration: ["p(95)<500"], // 95% of requests should complete < 500ms
  },
};

// Use BASE_URL from environment variable or default
const BASE_URL = __ENV.BASE_URL || "https://test-api.k6.io";

export default function () {
  // Send GET request
  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  // Basic checks
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is array": (r) => Array.isArray(r.json()),
  });

  sleep(1); // wait 1s before next iteration
}
