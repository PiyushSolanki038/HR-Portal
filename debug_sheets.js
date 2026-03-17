
import { readSheet } from './server/sheets.js';
import dotenv from 'dotenv';
dotenv.config();

async function debug() {
  try {
    const leaves = await readSheet('Leaves');
    if (leaves.length > 0) {
      console.log('--- LEAVES SHEET DEBUG ---');
      console.log('Total Rows:', leaves.length);
      console.log('Available Keys (Headers):', Object.keys(leaves[0]));
      console.log('First Row Data:', JSON.stringify(leaves[0], null, 2));
      
      const empIdKeys = Object.keys(leaves[0]).filter(k => k.toLowerCase().includes('emp'));
      console.log('Potential Emp ID Keys:', empIdKeys);
    } else {
      console.log('Leaves sheet is empty or not found.');
    }
  } catch (err) {
    console.error('Debug failed:', err);
  }
}

debug();
