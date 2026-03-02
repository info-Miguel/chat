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
        
        // 1. EXTRAER DATOS: Soporta tanto el formato con llave "DATA" como el plano.
        const masterContext = JSON.stringify(suiteData.DATA || suiteData);

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Eres el Consultor Estratégico Senior de BI MASTER SUITE.
                    
                    CONTEXTO DE INTELIGENCIA (ADN UNIFICADO):
                    ${masterContext}

                    MÓDULOS ACTIVOS EN TU ANÁLISIS:
                    - INGRESOS: 'BUDGET' (Presupuestos, clientes y totales).
                    - GASTOS/COSTOS: 'BI_COST' y 'BI_EXPENSES'.
                    - STOCK: 'BI_INVENTORY_FULL' (Inventario, SKU y almacenes).
                    - PLANIFICACIÓN: 'BI_FORECAST' (Metas de venta y estacionalidad).
                    - ESCENARIOS: 'PROJECT_SIMS' (Crecimiento, inflación e inversión).
                    - BIBLIOTECA: 'BI_ENGINE' (Ejercicios y modelos de cálculo).
                    - OPERACIONES: 'CRM_UNIFIED' (Pipeline de ejecución y estados).

                    REGLAS DE RESPUESTA:
                    - TODO está en el contexto superior. No digas que faltan archivos.
                    - Si el usuario pregunta "cómo voy", cruza BUDGET (Real) vs FORECAST (Metas).
                    - Usa PROJECT_SIMS para ajustar tus consejos según la inflación o el crecimiento detectado.
                    - Responde de forma técnica, con cifras exactas y sugerencias ejecutivas.
                    - Formato: Usa negritas para resaltar números clave y listas para recomendaciones.` 
                },
                { role: "user", content: question }
            ],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ answer: completion.choices[0].message.content });
    } catch (error) {
        console.error("Error en la comunicación con la IA:", error);
        res.status(500).json({ error: "Error procesando el ADN Maestro: " + error.message });
    }
});
