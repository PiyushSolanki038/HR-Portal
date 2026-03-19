import { google } from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

const SHEET_ID = process.env.GOOGLE_SHEET_ID
console.log(`[SHEETS_INIT] Using Sheet ID: "${SHEET_ID ? SHEET_ID.substring(0,5) + '...' : 'UNDEFINED'}"`)

let cachedAuth = null;
function getAuth() {
  if (cachedAuth) return cachedAuth;
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("MISSING_ENV_VAR: GOOGLE_SERVICE_ACCOUNT_JSON is not defined")
    }
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    cachedAuth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    return cachedAuth;
  } catch (err) {
    console.error("FATAL_AUTH_ERROR: Failed to initialize Google Auth:", err.message)
    throw err
  }
}

const CACHE = {}
const CACHE_TTL = 60000 // 60 seconds — reduces Google API calls
const HEADER_CACHE = {} 
const PENDING_READS = {} // Coalescing concurrent reads for the same tab

// All known tabs — used for batch operations
export const ALL_TABS = ['Employees', 'Attendance', 'Leaves', 'Mentors', 'Tasks', 'Messages', 'Governance', 'Audit']

async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isTransient = err.code === 429 || err.code === 500 || err.code === 503 || err.message?.includes('Quota') || err.message?.includes('socket hang up');
      if (i === retries - 1 || !isTransient) throw err;
      const wait = delay * Math.pow(2, i);
      console.warn(`[SHEETS_RETRY] Attempt ${i + 1} failed: ${err.message}. Retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// Internal fetch — always makes a real API call
async function _fetchSheet(tabName) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  let res;
  try {
    console.log(`[SHEETS_READ] Fetching tab: "${tabName}" from ID: "${SHEET_ID}"`)
    res = await retry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: tabName,
      valueRenderOption: 'FORMATTED_VALUE',
    }))
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
  const headers = rows[0].map(h => h.trim())
  const data = rows.slice(1)
    .filter(row => row.some(cell => cell && cell.trim() !== ''))
    .map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
    )

  CACHE[tabName] = { data, timestamp: Date.now() }
  return data
}

// Read all rows from a tab, returns array of objects using row 1 as keys
export async function readSheet(tabName) {
  // 1. Check cache first
  const now = Date.now()
  if (CACHE[tabName] && (now - CACHE[tabName].timestamp < CACHE_TTL)) {
    return CACHE[tabName].data
  }

  // 2. Coalesce: if there's already a fetch in-flight for this tab, wait for it
  if (PENDING_READS[tabName]) {
    console.log(`[SHEETS_COALESCE] Waiting for existing fetch of tab: "${tabName}"`)
    return PENDING_READS[tabName]
  }

  // 3. Start a new fetch and register it BEFORE any async work
  const fetchPromise = _fetchSheet(tabName).finally(() => {
    delete PENDING_READS[tabName]
  })
  PENDING_READS[tabName] = fetchPromise

  return fetchPromise
}


// Append a new row to a tab using an object (matches headers)
export async function appendRow(tabName, dataObj) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  
  // 1. Get current headers (cached)
  let headers = HEADER_CACHE[tabName]
  if (!headers) {
    const res = await retry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!1:1`,
    }))
    headers = (res.data.values && res.data.values[0]) || []
    HEADER_CACHE[tabName] = headers
  }
  
  // 2. Clear data cache for this tab
  delete CACHE[tabName]

  // If we got an array, just append it (legacy support if needed, but we prefer objects)
  if (Array.isArray(dataObj)) {
    await retry(() => sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: tabName,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [dataObj] },
    }))
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

  await retry(() => sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: tabName,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [rowValues] },
  }))
}

// Update a specific row by matching a field value
export async function updateRowWhere(tabName, field, value, updates) {
  delete CACHE[tabName] // Clear cache
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await retry(() => sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  }))
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
    await retry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [newHeaders] },
    }))
    // Update caches
    HEADER_CACHE[tabName] = newHeaders
    headers.length = 0
    headers.push(...newHeaders)
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
    await retry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A${rowIdx + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rows[rowIdx]] },
    }))
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
  const spreadsheet = await retry(() => sheets.spreadsheets.get({ spreadsheetId: SHEET_ID }))
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === tabName)
  if (!sheet) throw new Error(`Tab ${tabName} not found`)
  const sheetId = sheet.properties.sheetId

  // 2. Get rows to find the correct index
  const res = await retry(() => sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  }))
  const rows = res.data.values || []
  const headers = rows[0]
  const fieldIdx = headers.indexOf(field)
  const rowIdx = rows.findIndex((r, i) => i > 0 && r[fieldIdx] === value)
  
  if (rowIdx === -1) throw new Error(`Row with ${field}=${value} not found`)

  // 3. Delete the specific row
  await retry(() => sheets.spreadsheets.batchUpdate({
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
  }))
}

// Get a single row by field match
export async function findRow(tabName, field, value) {
  const rows = await readSheet(tabName)
  return rows.find(r => r[field] === value) || null
}

// Batch-fetch ALL tabs in a single Google API call
export async function batchReadAllSheets() {
  const now = Date.now()
  // Skip if all tabs are already cached
  const allCached = ALL_TABS.every(t => CACHE[t] && (now - CACHE[t].timestamp < CACHE_TTL))
  if (allCached) {
    console.log('[BATCH] All tabs cached, skipping API call')
    return Object.fromEntries(ALL_TABS.map(t => [t, CACHE[t].data]))
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  
  try {
    console.log(`[BATCH_READ] Fetching ALL tabs in one call...`)
    const res = await retry(() => sheets.spreadsheets.values.batchGet({
      spreadsheetId: SHEET_ID,
      ranges: ALL_TABS,
      valueRenderOption: 'FORMATTED_VALUE',
    }))

    const result = {}
    res.data.valueRanges.forEach((vr, idx) => {
      const tabName = ALL_TABS[idx]
      const rows = vr.values || []
      if (rows.length < 2) {
        result[tabName] = []
        CACHE[tabName] = { data: [], timestamp: Date.now() }
        return
      }
      const headers = rows[0].map(h => h.trim())
      const data = rows.slice(1)
        .filter(row => row.some(cell => cell && cell.trim() !== ''))
        .map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] || ''])))
      
      result[tabName] = data
      CACHE[tabName] = { data, timestamp: Date.now() }
    })

    console.log(`[BATCH_READ] ✅ All ${ALL_TABS.length} tabs loaded in one call`)
    return result
  } catch (err) {
    console.error('[BATCH_READ_ERROR]:', err.message)
    throw err
  }
}

// Pre-warm cache on server startup
export async function prewarmCache() {
  try {
    console.log('[PREWARM] Pre-warming cache for all tabs...')
    await batchReadAllSheets()
    console.log('[PREWARM] ✅ Cache ready — first requests will be instant')
  } catch (err) {
    console.error('[PREWARM_ERROR] Cache pre-warming failed:', err.message)
  }
}
