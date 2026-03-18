import { google } from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

const SHEET_ID = process.env.GOOGLE_SHEET_ID
console.log(`[SHEETS_INIT] Using Sheet ID: "${SHEET_ID ? SHEET_ID.substring(0,5) + '...' : 'UNDEFINED'}"`)

function getAuth() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("MISSING_ENV_VAR: GOOGLE_SERVICE_ACCOUNT_JSON is not defined")
    }
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  } catch (err) {
    console.error("FATAL_AUTH_ERROR: Failed to initialize Google Auth:", err.message)
    throw err
  }
}

const CACHE = {}
const CACHE_TTL = 2000 // 2 seconds

// Read all rows from a tab, returns array of objects using row 1 as keys
export async function readSheet(tabName) {
  const now = Date.now()
  if (CACHE[tabName] && (now - CACHE[tabName].timestamp < CACHE_TTL)) {
    return CACHE[tabName].data
  }

  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  let res;
  try {
    console.log(`[SHEETS_READ] Fetching tab: "${tabName}" from ID: "${SHEET_ID}"`)
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: tabName,
      valueRenderOption: 'FORMATTED_VALUE',
    })
  } catch (err) {
    const code = err.code || (err.response && err.response.status)
    if (code === 400 || code === '400') {
      console.warn(`Tab "${tabName}" not found or invalid request. Returning empty.`)
      return []
    }
    console.error(`[SHEETS_READ_ERROR] Tab: "${tabName}", ID: "${SHEET_ID}":`, err.message)
    if (err.response?.data) console.error('[SHEETS_DETAIL]:', JSON.stringify(err.response.data))
    throw err
  }
  const rows = res.data.values || []
  if (rows.length < 2) return []
  const headers = rows[0].map(h => h.trim()) // Trim headers
  const data = rows.slice(1)
    .filter(row => row.some(cell => cell && cell.trim() !== '')) // Filter entirely empty rows
    .map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    )

  CACHE[tabName] = { data, timestamp: now }
  return data
}

// Append a new row to a tab using an object (matches headers)
export async function appendRow(tabName, dataObj) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  
  // 1. Get current headers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!1:1`,
  })
  
  let headers = (res.data.values && res.data.values[0]) || []
  
  // 2. Clear cache for this tab
  delete CACHE[tabName]

  // If we got an array, just append it (legacy support if needed, but we prefer objects)
  if (Array.isArray(dataObj)) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: tabName,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [dataObj] },
    })
    return
  }

  // 3. Ensure all keys in dataObj exist as headers
  const missingCols = Object.keys(dataObj).filter(key => !headers.includes(key))
  if (missingCols.length > 0) {
    headers = [...headers, ...missingCols]
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!1:1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [headers] },
    })
  }

  // 4. Map object to array based on headers
  const rowValues = headers.map(h => dataObj[h] || '')

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: tabName,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [rowValues] },
  })
}

// Update a specific row by matching a field value
export async function updateRowWhere(tabName, field, value, updates) {
  delete CACHE[tabName] // Clear cache
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  })
  const rows    = res.data.values || []
  if (rows.length === 0) throw new Error(`Sheet ${tabName} is empty`)
  
  const headers = rows[0]
  const fieldIdx = headers.indexOf(field)
  if (fieldIdx === -1) throw new Error(`Column ${field} not found in ${tabName}`)
  
  // Check if any update keys are missing from headers
  const missingCols = Object.keys(updates).filter(key => !headers.includes(key))
  
  if (missingCols.length > 0) {
    // Add missing columns to header row in Google Sheets
    const newHeaders = [...headers, ...missingCols]
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [newHeaders] },
    })
    // Update local headers for the rest of this function
    headers.push(...missingCols)
  }

  const rowIdx   = rows.findIndex((r, i) => i > 0 && String(r[fieldIdx]) === String(value))
  if (rowIdx === -1) throw new Error(`Row with ${field}=${value} not found`)

  // Ensure the row has enough cells for new columns
  while (rows[rowIdx].length < headers.length) {
    rows[rowIdx].push('')
  }

  // Apply updates
  Object.entries(updates).forEach(([key, val]) => {
    const colIdx = headers.indexOf(key)
    if (colIdx !== -1) rows[rowIdx][colIdx] = val
  })

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A${rowIdx + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rows[rowIdx]] },
    })
  } catch (err) {
    console.error(`[SHEETS_UPDATE_ERROR] Tab: "${tabName}", Field: "${field}", Value: "${value}":`, err.message)
    if (err.response?.data) console.error('[SHEETS_DETAIL]:', JSON.stringify(err.response.data))
    throw err
  }
}

// Delete a specific row by matching a field value
export async function deleteRowWhere(tabName, field, value) {
  delete CACHE[tabName] // Clear cache
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  
  // 1. Get spreadsheet to find tabId
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === tabName)
  if (!sheet) throw new Error(`Tab ${tabName} not found`)
  const sheetId = sheet.properties.sheetId

  // 2. Get rows to find the correct index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  })
  const rows = res.data.values || []
  const headers = rows[0]
  const fieldIdx = headers.indexOf(field)
  const rowIdx = rows.findIndex((r, i) => i > 0 && r[fieldIdx] === value)
  
  if (rowIdx === -1) throw new Error(`Row with ${field}=${value} not found`)

  // 3. Delete the specific row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: rowIdx,
            endIndex: rowIdx + 1
          }
        }
      }]
    }
  })
}

// Get a single row by field match
export async function findRow(tabName, field, value) {
  const rows = await readSheet(tabName)
  return rows.find(r => r[field] === value) || null
}
