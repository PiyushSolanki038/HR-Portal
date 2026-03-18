from telegram import Update
from telegram.ext import ContextTypes
from datetime import datetime
from sheets import get_employee_by_chat_id, add_attendance, get_today_attendance, get_hr_chat_ids
from config import ATTENDANCE_START_HOUR, ATTENDANCE_END_HOUR, ATTENDANCE_END_MINUTE

async def attend_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text(
            "❌ You are not registered in SISWIT.\n"
            "Contact your HR manager to register your Telegram ID."
        )
        return

    # Check if already submitted today
    today_records = get_today_attendance(emp['id'])
    if today_records:
        await update.message.reply_text(
            f"✅ You already submitted attendance today at {today_records[-1]['time']}.\n\n"
            f"Report: {today_records[-1]['report']}"
        )
        return

    report = ' '.join(ctx.args) if ctx.args else None
    if not report:
        await update.message.reply_text(
            "Please include your work report.\n\n"
            "Usage: <code>/attend [what you worked on today]</code>\n\n"
            "Example: <code>/attend Fixed login bug, reviewed 3 PRs, updated documentation</code>",
            parse_mode='HTML'
        )
        return

    now   = datetime.now()
    hour  = now.hour
    min_val = now.minute
    
    # Calculate minutes since midnight
    current_mins = hour * 60 + min_val
    start_mins   = ATTENDANCE_START_HOUR * 60
    end_mins     = ATTENDANCE_END_HOUR * 60 + ATTENDANCE_END_MINUTE

    # Status: 'p' if inside 1 AM - 11:58 PM window, else 'l'
    is_inside_window = (current_mins >= start_mins and current_mins <= end_mins)
    status   = 'p' if is_inside_window else 'l'
    time_str = now.strftime("%I:%M %p")
    date_str = now.strftime("%Y-%m-%d")

    add_attendance(
        emp['id'], emp['name'], emp['dept'],
        date_str, time_str, status, report
    )

    # 🔔 Notify HR/Admins
    hr_ids = get_hr_chat_ids()
    hr_msg = (
        f"🔔 <b>New Attendance Marked</b>\n\n"
        f"👤 <b>Name:</b> {emp['name']}\n"
        f"🏢 <b>Dept:</b> {emp['dept']}\n"
        f"🕒 <b>Time:</b> {time_str}\n"
        f"📅 <b>Date:</b> {date_str}\n"
        f"📊 <b>Status:</b> {'✅ Present' if status == 'p' else '⚠️ Late'}\n"
        f"📝 <b>Report:</b> {report}"
    )
    for hr_id in hr_ids:
        try:
            # Don't send double notification if the HR manager is marks their own attendance
            if str(hr_id) != str(chat_id):
                await ctx.bot.send_message(chat_id=hr_id, text=hr_msg, parse_mode='HTML')
        except:
            pass

    if status == 'p':
        await update.message.reply_text(
            f"✅ <b>Attendance Recorded — On Time!</b>\n\n"
            f"👤 {emp['name']}\n"
            f"🕐 {time_str}\n"
            f"📅 {date_str}\n"
            f"📝 {report}",
            parse_mode='HTML'
        )
    else:
        await update.message.reply_text(
            f"⚠️ <b>Attendance Recorded — Late</b>\n\n"
            f"👤 {emp['name']}\n"
            f"🕐 {time_str} (Outside 1 AM - 11:58 PM window)\n"
            f"📅 {date_str}\n"
            f"📝 {report}\n\n"
            f"<i>Note: Submissions outside the standard window are marked as Late.</i>",
            parse_mode='HTML'
        )
