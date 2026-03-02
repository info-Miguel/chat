const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();

// Configuración de Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicialización de Groq con validación
const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: apiKey || 'SIN_KEY' });

// Ruta principal de análisis
app.post('/analyze', async (req, res) => {
    try {
        const { suiteData, question } = req.body;
        
        if (!suiteData) {
            return res.status(400).json({ answer: "Error: No se recibió la Suite de datos." });
        }

        // Extraemos los datos de la llave maestra
        const rawData = suiteData.DATA || suiteData;
        const masterContext = JSON.stringify(rawData);

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Eres el Consultor Senior de BI MASTER SUITE.
                    
                    DATOS DISPONIBLES:
                    ${masterContext}

                    INSTRUCCIONES:
                    - Tienes acceso a BUDGET, BI_COST, BI_EXPENSES, BI_INVENTORY_FULL, BI_FORECAST, PROJECT_SIMS y BI_ENGINE.
                    - Responde de forma ejecutiva y técnica basándote en estos datos.
                    - No menciones que faltan archivos; la información está integrada.` 
                },
                { role: "user", content: question }
            ],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ answer: completion.choices[0].message.content });

    } catch (error) {
        console.error("Error en /analyze:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta de salud para que Render sepa que el servidor vive
app.get('/health', (req, res) => res.send('OK'));

// INICIO DEL SERVIDOR - IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
