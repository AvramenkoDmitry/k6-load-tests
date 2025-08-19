import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% fails
    http_req_duration: ["p(95)<500"], // 95% < 500ms
  },
};

export default function () {
  const res = http.get("https://jsonplaceholder.typicode.com/users");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is array": (r) => Array.isArray(r.json()),
  });
}
