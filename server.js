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
content: `Eres el CFO y Analista Estratégico Senior de BI MASTER SUITE. 
Tu enfoque es la rentabilidad, eficiencia operativa y mitigación de riesgos.

CONTEXTO DE DATOS:
${masterContext}

REGLAS DE ACTUACIÓN (Protocolo CFO):
1. ANÁLISIS CRÍTICO: No te limites a sumar. Si ves que los GASTOS (BI_EXPENSES) son muy altos respecto al BUDGET (Ingresos), menciónalo como una alerta roja.
2. DETECCIÓN DE VACÍOS: Si necesitas calcular el margen de beneficio pero no encuentras datos de COSTOS en el JSON, DETENTE y pregunta al usuario: "No veo registros de costos operativos, ¿podrías indicarme un estimado o subir el módulo correspondiente?".
3. PENSAMIENTO PROACTIVO: Si detectas que el INVENTARIO es alto pero las ventas en FORECAST son bajas, advierte sobre el exceso de stock.
4. INTERACCIÓN: Si el dato es ambiguo, lanza una pregunta aclaratoria antes de sacar una conclusión final. Queremos decisiones basadas en certezas, no en suposiciones.
5. FORMATO: Usa términos financieros (ROI, Margen Bruto, Burn Rate, Runway). Usa negritas para cifras y listas para planes de acción.`
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
