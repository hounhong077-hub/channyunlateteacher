const { Telegraf } = require('telegraf');

// ជំនួសដោយ Bot Token និង Group/Admin Chat ID របស់អ្នក
const bot = new Telegraf('8760309681:AAFmRRMqDFzl4mA_oM5s_oEI5e5HcK458WU');
const adminChatId = '-5514831424'; // ឧទាហរណ៍៖ -1001234567890

// ពាក្យបញ្ជា /checkin សម្រាប់បើក Web App
bot.command('checkin', (ctx) => {
    const userName = ctx.from.first_name;
    
    ctx.reply(
        `សួស្តី ${userName}! សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទៀងផ្ទាត់ទីតាំង និងថតរូបភាពរបស់អ្នក៖`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: '📍 Verify current location', 
                            web_app: { url: 'https://your-domain.com/index.html' } 
                        }
                    ]
                ]
            }
        }
    );
});

// ទទួលទិន្នន័យពី Web App
bot.on('web_app_data', async (ctx) => {
    try {
        const userId = ctx.from.id;
        const fullName = `${ctx.from.first_name} ${ctx.from.last_name || ''}`;
        const username = ctx.from.username ? `@${ctx.from.username}` : 'គ្មាន Username';
        
        const data = JSON.parse(ctx.webApp.data);
        const lat = data.latitude;
        const lon = data.longitude;
        const imageBase64 = data.image;

        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

        // បើមានរូបភាពថតផ្ញើមកជាមួយ
        if (imageBase64) {
            const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, 'base64');

            await bot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                caption: `📍 **ប្រព័ន្ធបញ្ជាក់ទីតាំង និងរូបភាព:**\n` +
                         `- ឈ្មោះ: ${fullName} (${username})\n` +
                         `- ID: \`${userId}\`\n` +
                         `- កូអរដោនេ: Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}\n` +
                         `- 🗺 [ចុចទីនេះដើម្បីមើលផែនទី Google Maps](${googleMapsUrl})`,
                        parse_mode: 'Markdown'
            });
        } else {
            // ករណីគ្មានរូបភាព
            await bot.telegram.sendMessage(adminChatId, 
                `📍 **ប្រព័ន្ធបញ្ជាក់ទីតាំង (គ្មានរូបភាព):**\n` +
                `- ឈ្មោះ: ${fullName} (${username})\n` +
                `- ID: \`${userId}\`\n` +
                `- កូអរដោនេ: Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}\n` +
                `- 🗺 [ចុចទីនេះដើម្បីមើលផែនទី Google Maps](${googleMapsUrl})`,
                { parse_mode: 'Markdown' }
            );
        }

        ctx.reply('✅ បញ្ជូនទីតាំង និងរូបភាពជោគជ័យហើយ!');

    } catch (e) {
        console.error(e);
        ctx.reply('❌ មានបញ្ហាខុសឆ្គងក្នុងការបញ្ជូនទិន្នន័យ។');
    }
});

bot.launch();
console.log('Telegram Bot is running successfully...');
