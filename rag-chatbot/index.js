import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import 'dotenv/config';

const NEGOCIOS_FILE = 'negocios.json';
let negocios = JSON.parse(fs.readFileSync(NEGOCIOS_FILE, 'utf-8'));

let docs = negocios.map(neg => {
  const direccion = `${neg.direccion?.calle || ''}, ${neg.direccion?.colonia || ''}, ${neg.direccion?.ciudad || ''}, ${neg.direccion?.estado || ''}`;
  return {
    pageContent: `Nombre: ${neg.nombre}
    Categoría principal: ${neg.categoriaPrincipal}
    Categorías: ${neg.categorias?.join(', ')}
    Servicios: ${neg.servicios?.join(', ')}
    Palabras clave: ${neg.palabrasClave?.join(', ')}
    Zona: ${neg.zona}
    Dirección: ${direccion}
    Costo: ${neg.costo}
    Teléfono: ${neg.telefono}`,
        metadata: {
          nombre: neg.nombre,
          categoriaPrincipal: (neg.categoriaPrincipal || '').toLowerCase(),
          categorias: (neg.categorias || []).map(c => c.toLowerCase()),
          servicios: (neg.servicios || []).map(s => s.toLowerCase()),
          palabrasClave: (neg.palabrasClave || []).map(p => p.toLowerCase()),
          zona: (neg.zona || '').toLowerCase(),
          direccion,
          costo: (neg.costo || '').toLowerCase(),
          telefono: neg.telefono || '',
          prioridad: neg.prioridad || 0,
          latitud: neg.coordenadas?.latitud,
          longitud: neg.coordenadas?.longitud,
          activo: true
        }
      };
});

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
