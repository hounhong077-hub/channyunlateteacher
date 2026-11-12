const { Telegraf } = require('telegraf');

// ដាក់ Bot Token របស់អ្នកនៅទីនេះ
const botToken = process.env.BOT_TOKEN || '8760309681:AAFmRRMqDFzl4mA_oM5s_oEI5e5HcK458WU';
const bot = new Telegraf(botToken);

// ID ក្រុមធំរបស់អ្នក (ត្រូវប្រាកដថា Bot ស្ថិតនៅក្នុងក្រុមនេះ)
const groupChatId = '-5514831424'; 

// ដាក់ Link GitHub Pages (index.html) របស់អ្នកនៅទីនេះ
const webAppUrl = 'https://your-domain.com/index.html'; 

// កំណត់ Menu ពាក្យបញ្ជា
bot.telegram.setMyCommands([
    { command: 'checkin', description: 'សុំមកយឺត (ផ្ញើទីតាំង និងរូបថត)' }
]).catch(console.error);

// ពាក្យបញ្ជា /checkin សម្រាប់បើក Web App
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

// ពេល Bot ត្រូវ Add ចូលក្រុមថ្មី
bot.on('new_chat_members', (ctx) => {
    const botId = ctx.botInfo.id;
    const newMembers = ctx.message.new_chat_members;
    const botWasAdded = newMembers.some(member => member.id === botId);

    if (botWasAdded) {
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

// ទទួលទិន្នន័យពី Web App ហើយផ្ញើទៅក្រុម
bot.on('web_app_data', async (ctx) => {
    try {
        // ទាញយកទិន្នន័យពី Web App
        const data = JSON.parse(ctx.webApp.data);
        const lat = data.latitude;
        const lon = data.longitude;
        const imageUrl = data.imageUrl; // Link រូបភាពពី Google Drive
        const fullName = data.fullName;
        const username = data.username;
        const userId = data.userId;
        const mapUrl = data.mapUrl; // Link ផែនទីពី Web App

        // រៀបចំអត្ថបទសម្រាប់ផ្ញើទៅក្រុម
        const captionText = `📝 **របាយការណ៍មកធ្វើការយឺត:**\n\n` +
                            `👤 **ឈ្មោះ:** ${fullName}\n` +
                            `📌 **Username:** ${username}\n` +
                            `🆔 **Telegram ID:** \`${userId}\`\n\n` +
                            `🗺 **តំណភ្ជាប់ផែនទី:**\n[ចុចទីនេះដើម្បីមើល Google Maps](${mapUrl})`;

        // ១. ផ្ញើទីតាំង (Location) ពិតប្រាកដទៅក្រុម
        await bot.telegram.sendLocation(groupChatId, lat, lon);

        // ២. ផ្ញើរូបភាព និងអត្ថបទ (រួមទាំង Username និង Map URL) ទៅក្រុម
        if (imageUrl && imageUrl.startsWith('https://')) {
            await bot.telegram.sendPhoto(groupChatId, imageUrl, {
                caption: captionText,
                parse_mode: 'Markdown'
            });
        } else {
            // ប្រសិនបើគ្មានរូបភាព ផ្ញើតែអត្ថបទ
            await bot.telegram.sendMessage(groupChatId, captionText, { parse_mode: 'Markdown' });
        }

        // ឆ្លើយតបទៅកាន់អ្នកប្រើប្រាស់វិញថាជោគជ័យ
        ctx.reply('✅ បញ្ជូនរបាយការណ៍ និងទីតាំងទៅកាន់ក្រុមជោគជ័យហើយ!');

    } catch (e) {
        console.error("Error sending to group:", e);
        ctx.reply('❌ មានបញ្ហាខុសឆ្គងក្នុងការបញ្ជូនទិន្នន័យទៅក្រុម។');
    }
});

bot.launch();
console.log('Telegram Bot is running successfully...');
