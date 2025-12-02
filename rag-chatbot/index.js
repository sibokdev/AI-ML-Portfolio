import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import 'dotenv/config';

const { Client } = pkg;
const client = new Client();

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', async () => {
  console.log('Bot listo ✅');
});

client.on('message', async msg => {
  try {
    if (!msg || typeof msg.body === 'undefined') return;
    const from = msg.from;
    if (!from || from === 'status@broadcast' || from.includes('newsletter')) return;

    const texto = msg.body.trim().toLowerCase();
    const saludos = ['hola', 'buenas', 'hey', 'menu', 'opciones', 'iniciar'];
    console.log(from);
    // Line below update the whatsapp number to the number that is simulating a query to the chatbot, if you dont do that
    // the chatbot will start seend messages to all of his contacts
    if (from === '5212213903233@c.us'){    

      await msg.reply("📌 Hello world.");
      return;
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    try {
      if (msg && typeof msg.reply === 'function') {
        await msg.reply('⚠️ Hubo un error procesando tu mensaje. Intenta de nuevo.');
      }
    } catch (replyErr) {
      console.error('Error enviando mensaje de error:', replyErr);
    }
  }
});

client.initialize();
