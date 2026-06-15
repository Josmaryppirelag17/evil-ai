import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const chatLatency = new Trend('chat_latency');
const searchLatency = new Trend('search_latency');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    chat_latency: ['p(95)<8000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('chat endpoint', () => {
    const payload = JSON.stringify({ query: '¿Qué es la inteligencia artificial?' });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/chat`, payload, params);
    chatLatency.add(res.timings.duration);
    errorRate.add(res.status >= 400);
    check(res, { 'chat status 200': (r) => r.status === 200 });
  });

  sleep(1);

  group('search endpoint', () => {
    const payload = JSON.stringify({ query: 'últimas noticias tecnología' });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/search`, payload, params);
    searchLatency.add(res.timings.duration);
    errorRate.add(res.status >= 400);
    check(res, { 'search status 200': (r) => r.status === 200 });
  });

  sleep(2);
}
