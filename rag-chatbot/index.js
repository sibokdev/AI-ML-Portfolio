import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import 'dotenv/config';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';

const { Client } = pkg;
const client = new Client();

let vectorStore;
let chain;

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

async function iniciarRAG() {
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  vectorStore = await MemoryVectorStore.fromDocuments(docs.filter(d => d.metadata.activo), embeddings);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4',
    temperature: 0,
    streaming: false
  });

  const retriever = {
    getRelevantDocuments: async (query) => {
      const resultados = await vectorStore.similaritySearch(query, 10);
      const texto = query.toLowerCase();

      const zona = texto.match(/centro|norte|sur|texmelucan|huejotzingo/)?.[0];
      const costo = texto.match(/econ[oó]mico|barato|medio|caro/)?.[0];

      const filtrados = resultados.filter(doc => {
        const meta = doc.metadata;
        if (!meta.activo) return false;

        const campos = [
          meta.categoriaPrincipal,
          ...(meta.categorias || []),
          ...(meta.servicios || []),
          ...(meta.palabrasClave || [])
        ];

        const matchContenido = campos.some(p => texto.includes(p));
        const matchZona = zona ? (meta.zona || '').includes(zona) : true;
        const matchCosto = costo ? (meta.costo || '').includes(costo) : true;

        return matchContenido && matchZona && matchCosto;
      });

      const relevantes = filtrados.length > 0 ? filtrados : resultados;
      relevantes.sort((a, b) => b.metadata.prioridad - a.metadata.prioridad);
      return relevantes.slice(0, 3);
    }
  };

  const prompt = PromptTemplate.fromTemplate(
    `Eres un asistente amable y útil que responde preguntas sobre negocios en San Martín Texmelucan. 
      Basándote únicamente en la información proporcionada, responde de forma clara y natural a esta pregunta:

      {context}

      Pregunta: {question}

      Respuesta:`
      );

  chain = RetrievalQAChain.fromLLM(model, retriever, {
    prompt,
  });
}

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', async () => {
  console.log('Bot listo ✅');
  await iniciarRAG();
});

const estadoConversacion = {};
const registroTemp = {};

async function mostrarMenu(msg) {
  await msg.reply(`👋 ¡Hola! Bienvenido a *El Asistente de San Martín Texmelucan*.

  Con qué te gustaría que te pudiera ayudar? 
  Escribe el número correspondiente:

  1️⃣ - Qué hacer en San Martín Texmelucan  
  2️⃣ - Puntos de interés cerca de San Martín Texmelucan  
  3️⃣ - Historia de San Martín Texmelucan  
  4️⃣ - Lugares para comer  
  5️⃣ - Dependencias de gobierno  
  6️⃣ - Preguntar sobre un negocio en San Martín Texmelucan  
  7️⃣ - Registrar mi negocio

  📌 Puedes responder con el número de tu opción.`);
  estadoConversacion[msg.from] = 1;
}

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
          console.log(texto);
    // reinicio con saludo
    if (saludos.some(p => texto.includes(p))) {
      await mostrarMenu(msg);
      return;
    }

    const paso = estadoConversacion[from] || 0;

    // paso 1 = menú principal
    if (paso === 1) {
      switch (texto) {
        case "1":
          await msg.reply("📌 En San Martín puedes visitar el tianguis, templos, y zonas culturales.");
          await mostrarMenu(msg); // vuelve a mostrar el menú
          estadoConversacion[from] = 1;
          break;
        case "2":
          await msg.reply("🏞️ Cerca puedes visitar Huejotzingo, Cholula y Puebla capital.");
          await mostrarMenu(msg); // vuelve a mostrar el menú
          estadoConversacion[from] = 1;
          break;
        case "3":
          await msg.reply("📖 San Martín Texmelucan tiene una rica historia ligada al comercio y al ferrocarril.");
          await mostrarMenu(msg); // vuelve a mostrar el menú
          estadoConversacion[from] = 1;
          break;
        case "4":
          await msg.reply("🍽️ Recomendamos el mercado municipal y restaurantes locales.");
          await mostrarMenu(msg); // vuelve a mostrar el menú
          estadoConversacion[from] = 1;
          break;
        case "5":
          await msg.reply("🏛️ Puedes consultar dependencias en el palacio municipal en el centro.");
          await mostrarMenu(msg); // vuelve a mostrar el menú
          estadoConversacion[from] = 1;
          break;
        case "6":
          await msg.reply("🔍 Claro, dime qué tipo de negocio buscas.");
          estadoConversacion[from] = 2; // ahora espera la pregunta de RAG
          break;
        case "7":
          await msg.reply("📝 Perfecto, vamos a registrar tu negocio. ¿Cuál es el *nombre* de tu negocio?");
          estadoConversacion[from] = "registro_nombre";
          registroTemp[from] = {};
          break;
        default:
          await msg.reply("❌ Opción no válida. Escribe un número del 1 al 7.");
      }
      return;
    }

    // Paso 2: preguntar a RAG
    if (paso === 2) {
      const respuesta = await chain.call({
        query: texto
      });
      await msg.reply(respuesta.text || "No encontré información precisa.");
      estadoConversacion[from] = 0;
      return;
    }

    // Subflujo de registro
    if (paso === "registro_nombre") {
      registroTemp[from].nombre = msg.body.trim();
      await msg.reply("📍 Ahora dime la *dirección* de tu negocio:");
      estadoConversacion[from] = "registro_direccion";
      return;
    }
    if (paso === "registro_direccion") {
      registroTemp[from].direccion = msg.body.trim();
      await msg.reply("📞 Finalmente, comparte un *teléfono de contacto*:");
      estadoConversacion[from] = "registro_telefono";
      return;
    }
    if (paso === "registro_telefono") {
      registroTemp[from].telefono = msg.body.trim();
      await msg.reply("✅ ¡Tu negocio fue registrado con éxito! Será revisado antes de publicarse.");
      estadoConversacion[from] = 0;
      // aquí podrías guardar registroTemp[from] en tu JSON
      console.log("Nuevo negocio registrado:", registroTemp[from]);
      delete registroTemp[from];
      return;
    }
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
