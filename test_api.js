
import fetch from 'node-fetch';

async function test() {
  const endpoints = ['/api/employees', '/api/leaves', '/api/mentors', '/api/attendance/today'];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3001${ep}`);
      console.log(`Endpoint: ${ep}, Status: ${res.status}`);
      if (!res.ok) {
        const text = await res.text();
        console.log('Error Body:', text);
      }
    } catch (err) {
      console.error(`Fetch error for ${ep}:`, err);
    }
  }
}

test();
