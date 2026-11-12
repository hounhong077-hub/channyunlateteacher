const { Telegraf } = require('telegraf');

const botToken = process.env.BOT_TOKEN || '8760309681:AAFmRRMqDFzl4mA_oM5s_oEI5e5HcK458WU';
const bot = new Telegraf(botToken);

// ដាក់ Link GitHub Pages របស់អ្នកនៅទីនេះ
const webAppUrl = 'https://your-domain.com/index.html'; 

bot.telegram.setMyCommands([
    { command: 'checkin', description: 'សុំមកយឺត (ផ្ញើទីតាំង និងរូបថត)' }
]).catch(console.error);

bot.command('checkin', (ctx) => {
    const userName = ctx.from.first_name;
    ctx.reply(
        `សួស្តី ${userName}! សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ញើរបាយការណ៍មកយឺត៖`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📝 សុំមកយឺត', web_app: { url: webAppUrl } }]
                ]
            }
        }
    );
});

bot.on('new_chat_members', (ctx) => {
    const botId = ctx.botInfo.id;
    const newMembers = ctx.message.new_chat_members;
    if (newMembers.some(member => member.id === botId)) {
        ctx.reply(
            `សួស្តីបងប្អូនទាំងអស់គ្នា! 👋\nខ្ញុំគឺជា Bot សម្រាប់ជួយសម្រួលក្នុងការស្នើសុំមកធ្វើការយឺត។\nសូមវាយពាក្យ /checkin ឬចុចប៊ូតុងខាងក្រោមដើម្បីចាប់ផ្តើម៖`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📝 សុំមកយឺត', web_app: { url: webAppUrl } }]
                    ]
                }
            }
        );
    }
});

bot.launch();
console.log('Bot is running...');
