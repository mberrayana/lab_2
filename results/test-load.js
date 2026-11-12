import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '45s',
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    // Overall HTTP duration P95 must be under 500ms
    http_req_duration: ['p(95)<500'],
    
    // Tagged request specific thresholds
    'http_req_duration{name:list}': ['p(95)<500'],
    'http_req_duration{name:detail}': ['p(95)<500'],
    
    // Error rate must be below 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 1. Tagged Request: Product List
  const resList = http.get(`${BASE_URL}/products`, {
    tags: { name: 'list' },
  });

  check(resList, {
    'list: status is 200': (r) => r.status === 200,
    'list: response time < 500ms': (r) => r.timings.duration < 500,
    'list: returns products array': (r) => {
      try {
        return Array.isArray(r.json().products);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  // 2. Tagged Request: Product Detail (Random ID 1-20)
  const productId = Math.floor(Math.random() * 20) + 1;
  const resDetail = http.get(`${BASE_URL}/products/${productId}`, {
    tags: { name: 'detail' },
  });

  check(resDetail, {
    'detail: status is 200': (r) => r.status === 200,
    'detail: response time < 500ms': (r) => r.timings.duration < 500,
    'detail: correct product ID returned': (r) => {
      try {
        return r.json().id === productId;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  // 3. Tagged Request: Slow Endpoint (Simulates high-latency backend calls)
  const resSlow = http.get(`${BASE_URL}/products-slow`, {
    tags: { name: 'slow' },
  });

  check(resSlow, {
    'slow: status is 200': (r) => r.status === 200,
  });

  sleep(1);
}