// scripts/stress.js
import http from "k6/http";
import { check } from "k6";

const BASE_URL = "https://test-api.k6.io";

// ► EXECUTION: ramping-arrival-rate = растим запросы/сек, а k6 сам добавляет VU
export const options = {
  scenarios: {
    stress: {
      executor: "ramping-arrival-rate",
      startRate: 10, // начальный RPS
      timeUnit: "1s",
      preAllocatedVUs: 50, // заранее держим пул VU
      maxVUs: 300, // потолок VU на пике
      stages: [
        { target: 20, duration: "1m" },
        { target: 40, duration: "1m" },
        { target: 60, duration: "1m" },
        { target: 80, duration: "1m" },
        { target: 100, duration: "1m" },
        { target: 120, duration: "2m" }, // плато на высокой нагрузке
        { target: 0, duration: "30s" }, // спад
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"], // <2% ошибок
    http_req_duration: ["p(95)<1200", "p(99)<2000"], // SLA под стрессом
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  tags: { test: "stress" },
};

function safeJson(resp) {
  try {
    return resp.json();
  } catch {
    return null;
  }
}

export default function () {
  // стабильная лёгкая ручка для демонстрации
  const res = http.get(`${BASE_URL}/public/crocodiles/1/`);
  const data = safeJson(res);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "is JSON": () => data !== null,
    "body has id=1": () => data && data.id === 1,
  });

  // лог на случай HTML/ошибок (помогает отлавливать узкие места)
  if (res.status !== 200 || !data) {
    console.log(
      `status=${res.status} ct=${res.headers["Content-Type"]} body="${String(
        res.body
      ).slice(0, 100)}"`
    );
  }
}

export function handleSummary(data) {
  return { "results/summary-stress.json": JSON.stringify(data, null, 2) };
}
