import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createLead } from '../utils/nocodb'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'GEMINI_API_KEY no está configurado en el servidor.'
    })
  }

  const body = await readBody(event)
  const { messages, catalog } = body

  if (!messages || !Array.isArray(messages)) {
    throw createError({
      statusCode: 400,
      message: 'El formato de mensajes es inválido.'
    })
  }

  const systemPrompt = `Eres un asistente de soporte técnico y vendedor experto de la tienda ArduinoHN en Honduras.
Tu objetivo es resolver dudas técnicas sobre electrónica, Arduino, sensores, PLCs, etc., y recomendar productos de la tienda que el cliente pueda comprar.
Habla de forma amable, profesional y concisa.
Cuando recomiendes un producto, menciona su precio en HNL (Lempiras).
Si no sabes la respuesta o no tenemos el producto en el catálogo, dilo con amabilidad.

TIENES UNA MISION CRÍTICA: Cuando el cliente manifieste explícitamente que desea ordenar, comprar o cotizar un producto, DEBES pedirle amablemente los siguientes datos para procesar su orden:
1. Su nombre completo
2. Su número de teléfono (o WhatsApp)
3. Su correo electrónico (Email)
4. La ciudad de envío
5. Su dirección detallada
6. Confirma con ellos los productos que desean.

SOLO CUANDO EL CLIENTE TE HAYA DADO SU NOMBRE, TELÉFONO, EMAIL Y LOS PRODUCTOS, debes ejecutar la herramienta 'guardar_cotizacion'. Si falta el nombre, teléfono o email, pídeselo de nuevo.

Aquí tienes el catálogo actual de productos disponibles en la tienda (referencia interna, no lo menciones directamente a menos que sugieras un producto):
${JSON.stringify(catalog, null, 2)}
`

  const contents = messages.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }))

  const payload: any = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents,
    tools: [
      {
        functionDeclarations: [
          {
            name: "guardar_cotizacion",
            description: "Guarda los datos del cliente y los productos que desea comprar en la base de datos de ventas de NocoDB. Ejecuta esto SOLAMENTE cuando el cliente te haya proporcionado su nombre, teléfono, email y productos deseados.",
            parameters: {
              type: "OBJECT",
              properties: {
                Nombre: { type: "STRING", description: "Nombre completo del cliente" },
                Telefono: { type: "STRING", description: "Teléfono o WhatsApp de contacto" },
                Email: { type: "STRING", description: "Correo electrónico del cliente" },
                Productos: { type: "STRING", description: "Lista de productos y cantidades que el cliente quiere cotizar o comprar (ej. 1x Arduino Opta)" },
                Ciudad: { type: "STRING", description: "Ciudad de envío" },
                Direccion: { type: "STRING", description: "Dirección detallada de envío" },
                Notas: { type: "STRING", description: "Cualquier nota adicional o duda del cliente" }
              },
              required: ["Nombre", "Telefono", "Email", "Productos"]
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${config.geminiApiKey}`

  const callGemini = async (currentPayload: any) => {
    let retries = 3;
    let delay = 1000;
    while (retries > 0) {
      try {
        const response = await $fetch<any>(url, {
          method: 'POST',
          body: currentPayload
        })
        if (response.candidates && response.candidates.length > 0) {
          return response.candidates[0].content;
        } else {
          throw new Error('Respuesta vacía de Gemini')
        }
      } catch (error: any) {
        const is503 = error.response?.status === 503 || error.data?.error?.code === 503;
        if (is503 && retries > 1) {
          console.warn(`Gemini API en alta demanda (503). Reintentando en ${delay}ms... Quedan ${retries - 1} intentos.`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
          continue;
        }
        console.error('Error llamando a Gemini:', error.data || error)
        throw createError({ statusCode: 500, message: 'Error al comunicarse con la IA.' })
      }
    }
  }

  let aiContent = await callGemini(payload);

  // Comprobar si la IA decidió llamar a la función
  if (aiContent.parts[0].functionCall) {
    const funcCall = aiContent.parts[0].functionCall;
    
    if (funcCall.name === 'guardar_cotizacion') {
      const args = funcCall.args;
      
      try {
        // Guardar en NocoDB
        await createLead({
          Title: `Cotización Web - ${args.Nombre}`,
          Nombre: args.Nombre || '',
          Telefono: args.Telefono || '',
          Email: args.Email || '',
          Ciudad: args.Ciudad || '',
          Direccion: args.Direccion || '',
          Productos: args.Productos || '',
          Notas: args.Notas || 'Generado automáticamente por Chatbot'
        });
        
        // Devolver respuesta a Gemini indicando que la función fue exitosa
        payload.contents.push(aiContent);
        payload.contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: "guardar_cotizacion",
              response: {
                name: "guardar_cotizacion",
                content: { success: true, message: "Cotización guardada exitosamente en NocoDB. Agradece al cliente y despídete amablemente." }
              }
            }
          }]
        });

        // Llamar a Gemini nuevamente para que genere el texto final
        aiContent = await callGemini(payload);
      } catch (e) {
        console.error("Error guardando el lead en nocodb:", e);
        return { reply: "Tuvimos un problema técnico interno al guardar tu cotización. Por favor contáctanos directamente por WhatsApp." };
      }
    }
  }

  // Devolver la respuesta de texto final al frontend
  const finalReply = aiContent.parts?.find((p: any) => p.text)?.text || 'No pude procesar tu solicitud.';
  return { reply: finalReply };
})
