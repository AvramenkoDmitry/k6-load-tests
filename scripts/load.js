import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 10 }, // разгон до 10 VU
    { duration: "2m", target: 30 }, // разгон до 30 VU
    { duration: "2m", target: 30 }, // плато
    { duration: "1m", target: 0 }, // спад
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% ошибок
    http_req_duration: ["p(95)<800"], // p95 < 800ms
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)"],
  tags: { project: "k6-portfolio" },
};

const BASE_URL = "https://test-api.k6.io";

function safeJson(resp) {
  try {
    return resp.json();
  } catch (_) {
    return null;
  }
}

export default function () {
  const res = http.get(`${BASE_URL}/public/crocodiles/1/`);
  const data = safeJson(res);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "is JSON": () => data !== null,
    "body has id=1": () => data && data.id === 1,
  });

  if (res.status !== 200 || !data) {
    console.log(
      `status=${res.status} ct=${res.headers["Content-Type"]} body="${String(
        res.body
      ).slice(0, 80)}"`
    );
  }

  sleep(1);
}

// чтобы сохранять сводку в файл (можно прикладывать к репорту/PR)
export function handleSummary(data) {
  return { "results/summary.json": JSON.stringify(data, null, 2) };
}
