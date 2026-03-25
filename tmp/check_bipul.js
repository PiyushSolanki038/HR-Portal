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

async function checkBipul() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Employees!A:Z',
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const bipulRow = rows.find(row => row.includes('Bipul') || row.includes('MKT01'));
    
    if (bipulRow) {
      console.log('Bipul (MKT01) data:', JSON.stringify(bipulRow));
      bipulRow.forEach((cell, i) => {
        console.log(`  ${headers[i]}: "${cell}"`);
      });
    } else {
      console.log('Bipul (MKT01) not found in sheet.');
    }

    const attRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Attendance!A:Z',
    });
    const attRows = attRes.data.values || [];
    const bipulAtt = attRows.filter(row => row.includes('MKT01'));
    console.log(`\nBipul Attendance count: ${bipulAtt.length}`);
    bipulAtt.forEach(row => console.log(JSON.stringify(row)));

  } catch (err) {
    console.error(err);
  }
}

checkBipul();
