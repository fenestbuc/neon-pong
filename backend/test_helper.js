// Backend Test Helper
// Provides utilities for testing Cloudflare Worker and KV interactions

/**
 * Creates a minimal Cloudflare Workers environment mock
 */
function createWorkerEnv() {
  const kvData = new Map();
  
  return {
    // Mock KV namespace
    TEST_NAMESPACE: {
      async get(key) {
        return kvData.get(key) || null;
      },
      async put(key, value) {
        kvData.set(key, value);
      },
      async delete(key) {
        kvData.delete(key);
      },
      async list({ prefix }) {
        const keys = [];
        for (const key of kvData.keys()) {
          if (key.startsWith(prefix)) {
            keys.push({ name: key });
          }
        }
        return { keys };
      }
    },
    
    // Mock request
    createRequest(url, method = 'GET', body = null, headers = {}) {
      return new Request(url, {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
    },
    
    // Get stored data (for assertions)
    getKvData() {
      return new Map(kvData);
    },
    
    // Clear KV store between tests
    clearKv() {
      kvData.clear();
    }
  };
}

/**
 * Asserts that a Response has expected status and CORS headers
 */
function assertCorsResponse(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
  }
  
  const corsHeaders = [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers'
  ];
  
  for (const header of corsHeaders) {
    if (!response.headers.get(header)) {
      throw new Error(`Missing CORS header: ${header}`);
    }
  }
}

/**
 * Simulates score submission with retry logic
 */
async function submitScoreWithRetry(worker, scoreData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const request = new Request('https://api.example.com/scores', {
        method: 'POST',
        body: JSON.stringify(scoreData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await worker.fetch(request);
      if (response.status === 200) {
        return response;
      }
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Export for test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createWorkerEnv, assertCorsResponse, submitScoreWithRetry };
}
