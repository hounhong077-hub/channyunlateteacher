const { Telegraf } = require('telegraf');

// សូមដាក់ Bot Token និង Chat ID នៅទីនេះ
// ដើម្បីសុវត្ថិភាព គួរប្រើ process.env.BOT_TOKEN នៅពេលដាក់ឱ្យដំណើរការពិតប្រាកដ
const botToken = process.env.BOT_TOKEN || '8760309681:AAFmRRMqDFzl4mA_oM5s_oEI5e5HcK458WU';
const bot = new Telegraf(botToken);

// ID ក្រុម ឬ Admin ដែលត្រូវទទួលរបាយការណ៍
const adminChatId = '-5514831424'; 

// ពាក្យបញ្ជា /checkin សម្រាប់បើក Web App
bot.command('checkin', (ctx) => {
    const userName = ctx.from.first_name;
    
    ctx.reply(
        `សួស្តី ${userName}! សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ញើរបាយការណ៍មកយឺត៖`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: '📝 ការស្នើសុំមកធ្វើការយឺត', 
                            web_app: { url: 'https://your-domain.com/index.html' } // សូមប្តូរទៅ URL ពិតរបស់អ្នក
                        }
                    ]
                ]
            }
        }
    );
});

// ទទួលទិន្នន័យពី Web App (ប្រសិនបើអ្នកប្រើ tg.sendData ក្នុង HTML)
bot.on('web_app_data', async (ctx) => {
    try {
        const userId = ctx.from.id;
        const fullName = `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim();
        const username = ctx.from.username ? `@${ctx.from.username}` : 'គ្មាន Username';
        
        const data = JSON.parse(ctx.webApp.data);
        const lat = data.latitude;
        const lon = data.longitude;
        const imageBase64 = data.image;

        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

        // បើមានរូបភាពថតផ្ញើមកជាមួយ
        if (imageBase64 && imageBase64.startsWith('data:image')) {
            const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, 'base64');

            await bot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                caption: `📝 **របាយការណ៍មកធ្វើការយឺត:**\n` +
                         `- ឈ្មោះ: ${fullName} (${username})\n` +
                         `- ID: \`${userId}\`\n` +
                         `- កូអរដោនេ: Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}\n` +
                         `- 🗺 [ចុចទីនេះដើម្បីមើលផែនទី Google Maps](${googleMapsUrl})`,
                        parse_mode: 'Markdown'
            });
        } else {
            // ករណីគ្មានរូបភាព
            await bot.telegram.sendMessage(adminChatId, 
                `📝 **របាយការណ៍មកធ្វើការយឺត (គ្មានរូបភាព):**\n` +
                `- ឈ្មោះ: ${fullName} (${username})\n` +
                `- ID: \`${userId}\`\n` +
                `- កូអរដោនេ: Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}\n` +
                `- 🗺 [ចុចទីនេះដើម្បីមើលផែនទី Google Maps](${googleMapsUrl})`,
                { parse_mode: 'Markdown' }
            );
        }

        ctx.reply('✅ បញ្ជូនរបាយការណ៍ទៅកាន់ Admin ជោគជ័យហើយ!');

    } catch (e) {
        console.error(e);
        ctx.reply('❌ មានបញ្ហាខុសឆ្គងក្នុងការបញ្ជូនទិន្នន័យ។');
    }
});

bot.launch();
console.log('Telegram Bot (CYIS Late Request) is running successfully...');
