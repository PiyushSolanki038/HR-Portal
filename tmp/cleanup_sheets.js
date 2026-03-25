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

async function cleanup() {
  try {
    const tabs = ['Employees', 'Attendance'];
    
    for (const tab of tabs) {
      console.log(`\n--- Cleaning Tab: ${tab} ---`);
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tab}!A:Z`,
      });

      const rows = res.data.values || [];
      if (rows.length < 2) continue;

      const headers = rows[0];
      const idIdx = headers.indexOf('id');
      const empIdIdx = headers.indexOf('empId');

      let updatedCount = 0;
      const updatedRows = [...rows];

      for (let i = 1; i < rows.length; i++) {
        let rowModified = false;
        
        if (idIdx !== -1 && rows[i][idIdx]) {
          const original = rows[i][idIdx];
          const trimmed = original.trim();
          if (original !== trimmed) {
            updatedRows[i][idIdx] = trimmed;
            rowModified = true;
          }
        }

        if (empIdIdx !== -1 && rows[i][empIdIdx]) {
          const original = rows[i][empIdIdx];
          const trimmed = original.trim();
          if (original !== trimmed) {
            updatedRows[i][empIdIdx] = trimmed;
            rowModified = true;
          }
        }

        if (rowModified) {
          updatedCount++;
          console.log(`Row ${i + 1}: Modified ID from "${rows[i][idIdx || empIdIdx]}" to "${updatedRows[i][idIdx || empIdIdx]}"`);
        }
      }

      if (updatedCount > 0) {
        console.log(`Writing ${updatedCount} updated rows to ${tab}...`);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${tab}!A1`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: updatedRows },
        });
        console.log(`✅ Successfully cleaned ${tab}`);
      } else {
        console.log(`No trailing spaces found in ${tab}.`);
      }
    }

  } catch (err) {
    console.error('ERROR during cleanup:', err.message);
  }
}

cleanup();
