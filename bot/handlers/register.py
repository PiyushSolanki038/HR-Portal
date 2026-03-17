from telegram import Update
from telegram.ext import ContextTypes
from sheets import get_employee_by_chat_id

async def start_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if emp:
        await update.message.reply_text(
            f"👋 <b>Welcome back, {emp['name']}!</b>\n\n"
            f"🏢 {emp['role']} — {emp['dept']}\n"
            f"🆔 {emp['id']}\n\n"
            f"<b>Available Commands:</b>\n"
            f"📋 /attend [work report] — Submit today's attendance\n"
            f"🏖 /leave [date] [reason] — Request leave\n"
            f"📊 /status — View your attendance status\n"
            f"❓ /help — Show all commands",
            parse_mode='HTML'
        )
    else:
        await update.message.reply_text(
            f"👋 <b>Welcome to SISWIT!</b>\n\n"
            f"Your Telegram ID is: <code>{chat_id}</code>\n\n"
            f"You are not yet registered in the system.\n"
            f"Please share this ID with your HR manager to get registered.\n\n"
            f"Once registered, you can:\n"
            f"• Submit daily attendance\n"
            f"• Request leaves\n"
            f"• Check your attendance status",
            parse_mode='HTML'
        )
