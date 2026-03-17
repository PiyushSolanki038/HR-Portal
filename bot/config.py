import os
from dotenv import load_dotenv

# Load from root .env
load_dotenv("../.env")

BOT_TOKEN              = os.getenv("TELEGRAM_BOT_TOKEN")
SHEET_ID               = os.getenv("GOOGLE_SHEET_ID")
SERVICE_ACCOUNT_FILE   = "../credentials.json.json"
ATTENDANCE_START_HOUR  = 1    # 1 AM
ATTENDANCE_END_HOUR    = 23   # 11 PM
ATTENDANCE_END_MINUTE  = 58   # 58 mins
# No hard cutoff anymore, just status change
FREE_LEAVES_PER_MONTH  = 3
DEDUCTION_PER_LEAF     = 500
PORTAL_URL             = os.getenv("FRONTEND_URL", "http://localhost:5173")
