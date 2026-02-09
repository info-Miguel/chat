const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware: Permite CORS para que el móvil y el PC conecten
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ruta de comprobación (si entras desde el navegador verás esto)
app.get('/', (req, res) => {
    res.send('Servidor BI HUB AI está activo ✅');
});

// Ruta principal para analizar el ADN.json
app.post('/analyze', async (req, res) => {
    const { suiteData, question } = req.body;

    if (!suiteData || !question) {
        return res.status(400).json({ error: "Faltan datos (ADN o Pregunta)" });
    }

    try {
        // Llamamos a Groq (Modelo Llama 3) por su alta velocidad y gratuidad
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: "Eres el Analista Senior de BI HUB. Analiza el JSON financiero y operativo del usuario y responde de forma técnica, precisa y en español." 
                },
                { 
                    role: "user", 
                    content: `CONTEXTO ADN: ${JSON.stringify(suiteData)}. PREGUNTA: ${question}` 
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Enviamos la respuesta de la IA de vuelta al cliente
        res.json({ answer: response.data.choices[0].message.content });

    } catch (error) {
        console.error("Error en la IA:", error.response?.data || error.message);
        res.status(500).json({ error: "Error procesando la consulta con la IA." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
