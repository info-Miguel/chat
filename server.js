const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/analyze', async (req, res) => {
    try {
        const { suiteData, question } = req.body;
        
        // Creamos un contexto combinado de los 3 archivos
        const contextoMaster = JSON.stringify(suiteData.adn || {});
        const contextoForecast = JSON.stringify(suiteData.forecast || {});
        const contextoEngine = JSON.stringify(suiteData.engine || {});

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Eres un experto en BI. Tienes 3 fuentes de datos: 
                    1. MASTER ADN (Realidad actual): ${contextoMaster}
                    2. FORECAST (Proyecciones): ${contextoForecast}
                    3. ENGINE (Operaciones): ${contextoEngine}
                    Analiza de forma cruzada y responde de forma técnica y breve.` 
                },
                { role: "user", content: question }
            ],
            model: "llama-3.3-70b-versatile", // Modelo actualizado
        });

        res.json({ answer: completion.choices[0].message.content });
    } catch (error) {
        console.error("Error en la IA:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor BI activo en puerto ${PORT}`));
