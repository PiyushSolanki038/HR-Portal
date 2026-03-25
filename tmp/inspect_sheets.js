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
      ranges: ['Employees', 'Attendance'],
    });

    const employees = res.data.valueRanges[0].values || [];
    const attendance = res.data.valueRanges[1].values || [];

    console.log('--- EMPLOYEES ---');
    employees.slice(0, 10).forEach(row => console.log(JSON.stringify(row)));
    
    const amarEmployees = employees.filter(row => row.some(cell => String(cell).includes('Amar')));
    console.log('\n--- AMAR IN EMPLOYEES ---');
    amarEmployees.forEach(row => console.log(JSON.stringify(row)));

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    console.log('\n--- TODAY (IST):', today);

    const amarAttendance = attendance.filter(row => row.some(cell => String(cell).includes('Amar')));
    console.log('\n--- AMAR IN ATTENDANCE ---');
    amarAttendance.forEach(row => console.log(JSON.stringify(row)));

    const todayAttendance = attendance.filter(row => row.includes(today));
    console.log('\n--- TODAY ATTENDANCE ---');
    todayAttendance.forEach(row => console.log(JSON.stringify(row)));

  } catch (err) {
    console.error(err);
  }
}

inspect();
