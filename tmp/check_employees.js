import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkEmployees() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Employees!A:Z',
    });

    const rows = res.data.values || [];
    if (rows.length < 2) {
      console.log('No employees found in sheet.');
      return;
    }

    const headers = rows[0];
    const employees = rows.slice(1).map(row => 
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    );

    console.log(`Total Employees in Sheet: ${employees.length}`);

    const workforce = [];
    const filteredOut = [];

    employees.forEach(e => {
      const r = (e.role || '').toLowerCase();
      const n = (e.name || '').toLowerCase();
      
      const isFiltered = r.includes('admin') || 
                         r.includes('head') || 
                         r.includes('owner') || 
                         r.includes('hr manager') || 
                         n.includes('shreyansh') || 
                         n.includes('ankur');
      
      if (isFiltered) {
        filteredOut.push(e);
      } else {
        workforce.push(e);
      }
    });

    console.log(`\n--- Workforce (Displayed in Attendance) [${workforce.length}] ---`);
    workforce.forEach(e => console.log(`- ${e.id}: ${e.name} (${e.role}) [${e.dept}]`));

    console.log(`\n--- Filtered Out (Admins/Heads/Owners/HR) [${filteredOut.length}] ---`);
    filteredOut.forEach(e => console.log(`- ${e.id}: ${e.name} (${e.role})`));

  } catch (err) {
    console.error(err);
  }
}

checkEmployees();
