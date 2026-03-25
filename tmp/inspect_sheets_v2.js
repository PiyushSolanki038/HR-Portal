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

async function inspect() {
  try {
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: ['Employees!A:Z', 'Attendance!A:Z'],
    });

    const employees = res.data.valueRanges[0].values || [];
    const attendance = res.data.valueRanges[1].values || [];

    const empHeaders = employees[0];
    const attHeaders = attendance[0];

    console.log('Employee Headers:', JSON.stringify(empHeaders));
    console.log('Attendance Headers:', JSON.stringify(attHeaders));

    const amarEmps = employees.filter(row => row.some(cell => String(cell).includes('Amar')));
    console.log('\n--- Amar in Employees ---');
    amarEmps.forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
      row.forEach((cell, j) => {
        if (String(cell).includes('Amar')) {
          console.log(`  Col ${j} (${empHeaders[j]}): "${cell}" (Length: ${cell.length})`);
        }
      });
    });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const amarAtt = attendance.filter(row => row.some(cell => String(cell).includes('Amar')) && row.includes(today));
    console.log('\n--- Amar in Attendance (Today) ---');
    amarAtt.forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row));
    });

    // Check for "MKT04" specifically
    const mkt04Emps = employees.filter(row => row.includes('MKT04'));
    console.log('\n--- MKT04 in Employees ---');
    mkt04Emps.forEach(row => console.log(JSON.stringify(row)));

    const mkt04Att = attendance.filter(row => row.includes('MKT04') && row.includes(today));
    console.log('\n--- MKT04 in Attendance (Today) ---');
    mkt04Att.forEach(row => console.log(JSON.stringify(row)));

  } catch (err) {
    console.error(err);
  }
}

inspect();
