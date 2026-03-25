import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function inspect() {
  let output = '';
  const log = (msg) => { output += msg + '\n'; console.log(msg); };

  try {
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: ['Employees!A:Z', 'Attendance!A:Z'],
    });

    const employees = res.data.valueRanges[0].values || [];
    const attendance = res.data.valueRanges[1].values || [];

    const empHeaders = employees[0];
    const attHeaders = attendance[0];

    log('Employee Headers: ' + JSON.stringify(empHeaders));
    log('Attendance Headers: ' + JSON.stringify(attHeaders));

    const amarEmps = employees.filter(row => row.some(cell => String(cell).includes('Amar')));
    log('\n--- Amar in Employees ---');
    amarEmps.forEach((row, i) => {
      log(`Row ${i}: ` + JSON.stringify(row));
      row.forEach((cell, j) => {
        if (String(cell).includes('Amar')) {
          log(`  Col ${j} (${empHeaders[j]}): "${cell}" (Length: ${cell.length})`);
        }
      });
    });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const amarAtt = attendance.filter(row => row.some(cell => String(cell).includes('Amar')) && row.includes(today));
    log('\n--- Amar in Attendance (Today: ' + today + ') ---');
    amarAtt.forEach((row, i) => {
      log(`Row ${i}: ` + JSON.stringify(row));
    });

    const mkt04Emps = employees.filter(row => row.includes('MKT04'));
    log('\n--- MKT04 in Employees ---');
    mkt04Emps.forEach(row => log(JSON.stringify(row)));

    const mkt04Att = attendance.filter(row => row.includes('MKT04') && row.includes(today));
    log('\n--- MKT04 in Attendance (Today) ---');
    mkt04Att.forEach(row => log(JSON.stringify(row)));

    fs.writeFileSync('c:\\Users\\Piyus\\OneDrive\\Desktop\\solanki12\\tmp\\inspect_results.txt', output);
    log('\nResults written to tmp/inspect_results.txt');

  } catch (err) {
    log('ERROR: ' + err.message);
    if (err.stack) log(err.stack);
  }
}

inspect();
