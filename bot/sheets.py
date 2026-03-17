import gspread
from google.oauth2.service_account import Credentials
from config import SHEET_ID, SERVICE_ACCOUNT_FILE
from datetime import datetime

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
]

def get_sheet():
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    gc = gspread.authorize(creds)
    return gc.open_by_key(SHEET_ID)

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
