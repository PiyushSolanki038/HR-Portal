from telegram import Update
from telegram.ext import ContextTypes
from sheets import get_employee_by_chat_id, get_today_attendance, get_employee_stats
from datetime import datetime

STATUS_LABELS = { 'p':'✅ On Time', 'l':'⚠️ Late', 'a':'❌ Absent', 'x':'🏖 On Leave' }

async def status_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text("❌ Not registered. Contact HR.")
        return

    today_recs = get_today_attendance(emp['id'])
    stats      = get_employee_stats(emp['id'])
    month      = datetime.now().strftime('%B %Y')

    if today_recs:
        rec   = today_recs[-1]
        label = STATUS_LABELS.get(rec['status'], '?')
        msg = (
            f"📊 <b>Your Status — {datetime.now().strftime('%d %b %Y')}</b>\n\n"
            f"{label}\n"
            f"🕐 Submitted at: {rec['time']}\n"
            f"📝 Report: {rec['report']}\n\n"
            f"<b>This Month ({month}):</b>\n"
            f"✅ Present: {stats['present']} days\n"
            f"⚠️ Late: {stats['late']} times\n"
            f"🏖 Leaves taken: {stats['leaves']}/3"
        )
    else:
        msg = (
            f"📊 <b>Your Status — {datetime.now().strftime('%d %b %Y')}</b>\n\n"
            f"⚠️ No attendance submitted today.\n\n"
            f"Submit now: <code>/attend [your work report]</code>\n\n"
            f"<b>This Month ({month}):</b>\n"
            f"✅ Present: {stats['present']} days\n"
            f"⚠️ Late: {stats['late']} times\n"
            f"🏖 Leaves taken: {stats['leaves']}/3"
        )

    await update.message.reply_text(msg, parse_mode='HTML')
