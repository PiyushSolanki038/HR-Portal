from telegram import Update
from telegram.ext import ContextTypes

async def help_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 <b>SISWIT Bot Commands</b>\n\n"
        "📋 /attend [report] — Submit today's attendance\n"
        "🏖 /leave [DD-MM] — Request a leave (Buttons available)\n"
        "📊 /status — View your attendance status\n"
        "👋 /start — Welcome and registration info\n"
        "❓ /help — Show this help message\n\n"
        "<i>For support, contact your HR manager.</i>",
        parse_mode='HTML'
    )
