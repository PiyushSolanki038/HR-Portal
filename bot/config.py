import os
from dotenv import load_dotenv

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Root directory of the project
ROOT_DIR = os.path.dirname(BASE_DIR)

# Load from root .env using absolute path
load_dotenv(os.path.join(ROOT_DIR, ".env"))

BOT_TOKEN              = os.getenv("TELEGRAM_BOT_TOKEN")
SHEET_ID               = os.getenv("GOOGLE_SHEET_ID")
# JSON string for service account (preferred)
SERVICE_ACCOUNT_JSON   = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
# Fallback to file if JSON string not present
SERVICE_ACCOUNT_FILE   = os.path.join(ROOT_DIR, "credentials.json.json")

ATTENDANCE_START_HOUR  = 1    # 1 AM
ATTENDANCE_END_HOUR    = 23   # 11 PM
ATTENDANCE_END_MINUTE  = 58   # 58 mins
FREE_LEAVES_PER_MONTH  = 3
DEDUCTION_PER_LEAF     = 500
PORTAL_URL             = os.getenv("FRONTEND_URL", "http://localhost:5173")
TELEGRAM_ADMIN_ID      = os.getenv("TELEGRAM_ADMIN_ID")
