import gspread
import json
from google.oauth2.service_account import Credentials
from config import SHEET_ID, SERVICE_ACCOUNT_FILE, SERVICE_ACCOUNT_JSON
from datetime import datetime

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
]

def get_sheet():
    try:
        if SERVICE_ACCOUNT_JSON:
            info = json.loads(SERVICE_ACCOUNT_JSON)
            creds = Credentials.from_service_account_info(info, scopes=SCOPES)
        else:
            creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        
        gc = gspread.authorize(creds)
        return gc.open_by_key(SHEET_ID)
    except Exception as e:
        print(f"❌ [SHEETS_ERROR] Failed to connect to Google Sheets: {str(e)}")
        raise

def get_employee_by_chat_id(chat_id):
    sh = get_sheet()
    ws = sh.worksheet('Employees')
    records = ws.get_all_records()
    for emp in records:
        if str(emp.get('telegramChatId', '')) == str(chat_id):
            return emp
    return None

def get_employee_by_id(emp_id):
    sh = get_sheet()
    ws = sh.worksheet('Employees')
    records = ws.get_all_records()
    for emp in records:
        if emp.get('id') == emp_id:
            return emp
    return None

def add_attendance(emp_id, emp_name, dept, date, time_str, status, report):
    sh = get_sheet()
    ws = sh.worksheet('Attendance')
    att_id = f"ATT{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ws.append_row([
        att_id, emp_id, emp_name, dept,
        date, time_str, status, report,
        datetime.now().isoformat()
    ])
    # Sync stats to Employees sheet
    try:
        sync_employee_stats(emp_id)
    except Exception as e:
        print(f"⚠️ Failed to sync stats: {str(e)}")

def sync_employee_stats(emp_id):
    sh = get_sheet()
    att_ws = sh.worksheet('Attendance')
    emp_ws = sh.worksheet('Employees')
    lvs_ws = sh.worksheet('Leaves')
    
    att_records = att_ws.get_all_records()
    emp_records = emp_ws.get_all_records()
    lvs_records = lvs_ws.get_all_records()
    
    # Find employee row index and joining date
    emp_row_idx = None
    emp_joining = '1970-01-01'
    for i, emp in enumerate(emp_records):
        if str(emp.get('id')) == str(emp_id):
            emp_row_idx = i + 2 # 1-indexed + header
            emp_joining = emp.get('joining') or '1970-01-01'
            break
            
    if not emp_row_idx: return

    # Calculate stats
    recs = [r for r in att_records if str(r.get('empId')) == str(emp_id)]
    p = len([r for r in recs if r.get('status') == 'p'])
    l = len([r for r in recs if r.get('status') == 'l'])
    
    # Count approved leaves
    emp_leaves = [lv for lv in lvs_records if str(lv.get('empId')) == str(emp_id) and (str(lv.get('status', '')).lower() == 'approved' or 'day' in str(lv.get('status', '')).lower())]
    
    attended = p + l + len(emp_leaves)
    
    all_dates = sorted(list(set([r.get('date') for r in att_records if r.get('date')])))
    emp_working_days = len([d for d in all_dates if d >= emp_joining])
    
    score = min(100, round((attended / emp_working_days) * 100)) if emp_working_days > 0 else 100
    absent = max(0, emp_working_days - attended)
    
    # Get column indices
    headers = emp_ws.row_values(1)
    col_map = {h.lower(): i+1 for i, h in enumerate(headers)}
    
    # Batch update values if column exists
    if 'present' in col_map: emp_ws.update_cell(emp_row_idx, col_map['present'], p)
    if 'late' in col_map:    emp_ws.update_cell(emp_row_idx, col_map['late'], l)
    if 'absent' in col_map:  emp_ws.update_cell(emp_row_idx, col_map['absent'], absent)
    if 'score' in col_map:   emp_ws.update_cell(emp_row_idx, col_map['score'], score)

def get_today_attendance(emp_id):
    sh = get_sheet()
    ws = sh.worksheet('Attendance')
    today = datetime.now().strftime('%Y-%m-%d')
    records = ws.get_all_records()
    return [r for r in records if r.get('empId') == emp_id and r.get('date') == today]

def add_leave_request(emp_id, emp_name, dept, date, leave_type, reason):
    sh = get_sheet()
    leaves_ws = sh.worksheet('Leaves')

    # Count this month's leaves
    month = datetime.now().strftime('%Y-%m')
    all_leaves = leaves_ws.get_all_records()
    month_leaves = [l for l in all_leaves
                    if l.get('empId') == emp_id
                    and str(l.get('date', '')).startswith(month)
                    and l.get('status') != 'rejected']

    leave_num     = len(month_leaves) + 1
    deduction_amt = 500 if leave_num > 3 else 0
    leave_id      = f"LV{datetime.now().strftime('%Y%m%d%H%M%S')}"

    leaves_ws.append_row([
        leave_id, emp_id, emp_name, dept, date,
        leave_type, reason, 'pending',
        leave_num, deduction_amt, '', '',
        datetime.now().isoformat()
    ])
    return leave_num, deduction_amt

def get_employee_stats(emp_id):
    sh = get_sheet()
    att_ws = sh.worksheet('Attendance')
    leave_ws = sh.worksheet('Leaves')

    month = datetime.now().strftime('%Y-%m')
    records = att_ws.get_all_records()
    month_att = [r for r in records
                 if r.get('empId') == emp_id
                 and str(r.get('date', '')).startswith(month)]

    leaves = leave_ws.get_all_records()
    month_leaves = [l for l in leaves
                    if l.get('empId') == emp_id
                    and str(l.get('date', '')).startswith(month)
                    and l.get('status') == 'approved']

    present  = len([r for r in month_att if r.get('status') == 'p'])
    late     = len([r for r in month_att if r.get('status') == 'l'])
    on_leave = len(month_leaves)

    return { 'present': present, 'late': late, 'leaves': on_leave }

def get_hr_chat_ids():
    sh = get_sheet()
    ws = sh.worksheet('Employees')
    records = ws.get_all_records()
    hr_roles = ['hr manager', 'admin']
    ids = []
    for emp in records:
        role = str(emp.get('role', '')).lower()
        chat_id = emp.get('telegramChatId')
        if role in hr_roles and chat_id:
            ids.append(str(chat_id))
    return list(set(ids)) # Unique IDs
