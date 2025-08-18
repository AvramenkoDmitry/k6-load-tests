# k6 Load Tests

![CI](https://github.com/AvramenkoDmitry/k6-load-tests/actions/workflows/ci.yml/badge.svg)

Small performance test suite using [k6](https://k6.io/), targeting the public `test-api.k6.io`.

## ✅ Scenarios

- **Smoke**: quick sanity check (`scripts/smoke.js`)
- **Load**: step-wise load with thresholds (`scripts/load.js`)

## 🧪 What we validate

- Error rate `< 1%` (`http_req_failed`)
- Latency P95 `smoke < 500ms`, `load < 800ms`
- Functional checks (status, body fields)

## 🚀 Run locally

```bash
# 1) Install k6 (macOS)
brew install k6
# Ubuntu: sudo apt-get update && sudo apt-get install -y gnupg2 && \
# curl -s https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg && \
# echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
# sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install -y k6

# 2) Smoke
k6 run scripts/smoke.js

# 3) Load (with custom base url)
BASE_URL=https://test-api.k6.io k6 run scripts/load.js
```
