from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler
from config import BOT_TOKEN
from handlers.attend   import attend_handler
from handlers.leave    import leave_handler, leave_callback_handler
from handlers.status   import status_handler
from handlers.register import start_handler
from handlers.help     import help_handler

def main():
    print("🤖 SISWIT Bot starting...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler('start',  start_handler))
    app.add_handler(CommandHandler('attend', attend_handler))
    app.add_handler(CommandHandler('leave',  leave_handler))
    app.add_handler(CommandHandler('status', status_handler))
    app.add_handler(CommandHandler('help',   help_handler))
    
    app.add_handler(CallbackQueryHandler(leave_callback_handler, pattern="^leave_"))

    print("✅ Bot is running. Press Ctrl+C to stop.")
    app.run_polling()

if __name__ == '__main__':
    main()
