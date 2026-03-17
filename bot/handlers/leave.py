from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from datetime import datetime, timedelta
from sheets import get_employee_by_chat_id, add_leave_request

async def leave_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text("❌ Not registered. Contact HR.")
        return

    # If no arguments, show dynamic buttons
    if not ctx.args:
        keyboard = [
            [
                InlineKeyboardButton("📅 Today", callback_data="leave_today"),
                InlineKeyboardButton("🌅 Tomorrow", callback_data="leave_tomorrow"),
            ],
            [InlineKeyboardButton("🔢 Other Date (Type /leave DD-MM)", callback_data="leave_help")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "<b>Select Leave Date:</b>",
            reply_markup=reply_markup,
            parse_mode='HTML'
        )
        return

    # Argument handling (unchanged for manual typing)
    date_input = ctx.args[0].lower()
    reason = ' '.join(ctx.args[1:]) if len(ctx.args) > 1 else "Not specified"
    await processed_leave_request(update, emp, date_input, reason)

async def processed_leave_request(update: Update, emp, date_input, reason):
    # Logic to process and save the leave (moved from original handler)
    now = datetime.now()
    target_date = None
    
    if date_input == 'today':
        target_date = now.strftime('%Y-%m-%d')
    elif date_input == 'tomorrow':
        target_date = (now + timedelta(days=1)).strftime('%Y-%m-%d')
    else:
        formats = ['%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m', '%d/%m']
        for fmt in formats:
            try:
                dt = datetime.strptime(date_input, fmt)
                if '%Y' not in fmt: dt = dt.replace(year=now.year)
                target_date = dt.strftime('%Y-%m-%d')
                break
            except ValueError: continue
            
    if not target_date:
        await update.message.reply_text("❌ Invalid date. Use <code>DD-MM</code> or <code>today</code>.", parse_mode='HTML')
        return

    leave_num, deduction = add_leave_request(emp['id'], emp['name'], emp['dept'], target_date, 'casual', reason)

    msg = (
        f"✅ <b>Leave Request Submitted!</b>\n\n"
        f"📅 Date: <b>{target_date}</b>\n"
        f"📝 Reason: {reason}\n"
        f"📊 Leave #{leave_num} this month\n\n"
        f"⏳ Status: <b>Pending HR Approval</b>"
    )
    if deduction > 0:
        msg += f"\n\n⚠️ <b>₹{deduction} deduction will apply</b>"

    if update.callback_query:
        await update.callback_query.edit_message_text(msg, parse_mode='HTML')
    else:
        await update.message.reply_text(msg, parse_mode='HTML')

async def leave_callback_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)
    
    if not emp:
        await query.edit_message_text("❌ Not registered.")
        return

    if query.data == "leave_today":
        await processed_leave_request(update, emp, "today", "Automated Request")
    elif query.data == "leave_tomorrow":
        await processed_leave_request(update, emp, "tomorrow", "Automated Request")
    elif query.data == "leave_help":
        await query.edit_message_text(
            "<b>Manual Leave Request:</b>\n\n"
            "Usage: <code>/leave DD-MM [Reason]</code>\n"
            "Example: <code>/leave 25-03 Family function</code>",
            parse_mode='HTML'
        )
