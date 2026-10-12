import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Default API Key from Google AI Studio
const DEFAULT_GEMINI_KEY = 'AIzaSyDxrDQPUZWfspw0mlBC-fBbgSil1n40PdU';

// Helper to get GoogleGenAI client
function getGenAIClient(customApiKey?: string): GoogleGenAI {
  const key = customApiKey?.trim() || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  if (!key) {
    throw new Error('No Gemini API key configured. Please configure it in Settings or provide an API key.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to execute generateContent with fallback models
async function generateWithFallback(client: GoogleGenAI, config: any) {
  const models = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastErr = null;

  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        ...config,
        model,
      });
      return { response, model };
    } catch (err: any) {
      console.warn(`Model ${model} error:`, err.message || err);
      lastErr = err;
      // If 503 or 429, continue to next model
      continue;
    }
  }

  throw lastErr || new Error('All Gemini model fallbacks exhausted.');
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasEnvKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Test Gemini API key
app.post('/api/gemini/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const client = getGenAIClient(apiKey);
    const startTime = Date.now();
    
    const { response, model } = await generateWithFallback(client, {
      contents: 'Respond with exactly: "OK: Gemini API Connected Successfully"',
    });

    const latency = Date.now() - startTime;
    res.json({
      success: true,
      message: response.text?.trim() || 'Connected',
      latencyMs: latency,
      model,
    });
  } catch (error: any) {
    console.error('Test Key Error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to authenticate with Gemini API',
    });
  }
});

// Promoter Chat Assistant & Recipe Guide
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], currentProduct, customApiKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const client = getGenAIClient(customApiKey);

    const productContext = currentProduct
      ? `The sales promoter is currently presenting this appliance:
- Brand: ${currentProduct.brand}
- Model: ${currentProduct.name} (${currentProduct.modelNumber || 'Standard'})
- Category: ${currentProduct.category}
- Capacity / Power: ${currentProduct.capacity || 'N/A'}, ${currentProduct.power || 'N/A'}
- Specs: ${currentProduct.features ? currentProduct.features.join(', ') : 'Standard'}
- Dimensions: ${currentProduct.dimensions || 'N/A'}
`
      : 'No specific appliance currently selected. General promoter mode.';

    const systemInstruction = `You are the executive AI Sales Promoter Co-Pilot for retail store sales promoters handling premium home & kitchen appliances (especially Bajaj, Morphy Richards, and equivalent brands).

Your responsibilities:
1. RECIPE INSTRUCTIONS WITH THE SPECIFIED APPLIANCE:
   When asked how to prepare a dish or recipe using an appliance model:
   - Provide exact appliance settings: temperature (°C), timer (mins), preheating requirements, rack/basket placement, and accessories (e.g. baking tray, wire rack, rotisserie rod, chutney jar, air fryer crisper plate).
   - Give concise, fool-proof steps so the promoter can demonstrate or guide the walk-in customer with total confidence.
   - Mention key tips for best crispness, fluffiness, or texture.

2. SALES PITCHING & COUNTER-ARGUMENTS:
   - Give punchy, persuasive customer-facing talking points to close sales on the retail store floor.
   - Explain why this model is superior to cheaper alternatives or competitors (build quality, warranty, power wattage, safety features).

3. YOUTUBE RECIPES / VIDEO RECOMMENDATIONS:
   - Suggest relevant YouTube search terms or video recommendations (e.g., "Search on YouTube: 'Morphy Richards 5L Air Fryer crispy paneer tikka recipe'") and briefly describe what visual demo to show the customer.

Tone: Crisp, professional, encouraging, practical, and tailored for fast in-store customer assistance. Avoid fluff.`;

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `[Active Appliance Context]\n${productContext}\n\n[Sales Promoter Question]\n${message}`,
          },
        ],
      },
    ];

    const { response } = await generateWithFallback(client, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with AI assistant' });
  }
});

// Dedicated AI Recipe Preparation Guide with YouTube Link
app.post('/api/gemini/recipe-guide', async (req, res) => {
  try {
    const { dishName, product, customApiKey } = req.body;

    if (!dishName) {
      return res.status(400).json({ error: 'Dish name is required' });
    }

    const client = getGenAIClient(customApiKey);

    const prompt = `Provide the exact cooking instructions and YouTube demo search for preparing "${dishName}" using the appliance:
Brand: ${product?.brand || 'Appliance'}
Model: ${product?.name || 'Standard Model'}
Category: ${product?.category || 'Kitchen Appliance'}
Power / Capacity: ${product?.power || ''} ${product?.capacity || ''}

Return JSON with:
1. cookingMode: e.g. "185°C Air Fry Mode" or "200°C Top + Bottom Heat"
2. tempAndTimer: exact cooking temperature and minutes
3. accessoryUsed: accessory e.g. wire rack, baking tray, crisper basket
4. steps: array of 4 clear step-by-step instructions (prep, preheat/setup, cook/flip, finish)
5. proTip: one crucial chef secret to ensure crispness, fluffiness, or tenderness
6. youtubeQuery: ideal YouTube search query to show customer video demonstration`;

    const { response } = await generateWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an executive appliance culinary chef. Return JSON conforming strictly to the requested schema. Focus solely on how to cook the dish in this appliance model and providing the YouTube search query.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cookingMode: { type: Type.STRING },
            tempAndTimer: { type: Type.STRING },
            accessoryUsed: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            proTip: { type: Type.STRING },
            youtubeQuery: { type: Type.STRING },
          },
          required: ['cookingMode', 'tempAndTimer', 'accessoryUsed', 'steps', 'proTip', 'youtubeQuery'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      parsed.youtubeQuery || `${product?.brand || ''} ${dishName} recipe demonstration`
    )}`;

    res.json({
      ...parsed,
      youtubeUrl,
    });
  } catch (error: any) {
    console.error('Recipe Guide Error:', error);
    res.status(500).json({ error: error.message || 'Error generating recipe guide' });
  }
});

// AI Product Specification & Recipe Dossier Generator
app.post('/api/gemini/product-intel', async (req, res) => {
  try {
    const { brand, category, modelName, customApiKey } = req.body;

    if (!modelName) {
      return res.status(400).json({ error: 'Model name or product name is required' });
    }

    const client = getGenAIClient(customApiKey);

    const prompt = `Generate a comprehensive, verified retail product dossier for the home appliance:
Brand: ${brand || 'Bajaj / Morphy Richards'}
Category: ${category || 'Kitchen Appliance'}
Model Name / Search: ${modelName}

Provide realistic official specifications, dimensions, promoter sales hooks, recipe possibilities, and reference URLs.`;

    const { response } = await generateWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: `You are a product catalog manager and appliance engineer. Return complete JSON conforming strictly to the requested schema. Ensure dimensions, wattages, capacities, and sales promoter USPs match real market specifications for Bajaj, Morphy Richards, or the requested appliance brand.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full marketing model name' },
            modelNumber: { type: Type.STRING, description: 'Model number code, e.g. ' },
            brand: { type: Type.STRING, description: 'Brand name' },
            category: { type: Type.STRING, description: 'Category name' },
            mrp: { type: Type.NUMBER, description: 'Standard MRP in INR' },
            sellingPrice: { type: Type.NUMBER, description: 'Store offer selling price in INR' },
            power: { type: Type.STRING, description: 'Power rating, e.g. 1500 Watts / 750W' },
            capacity: { type: Type.STRING, description: 'Capacity, e.g. 5.5 Litres / 28L / 3 Jars' },
            warranty: { type: Type.STRING, description: 'Warranty period, e.g. 2 Years Product + 5 Years Motor' },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                height: { type: Type.STRING, description: 'Height, e.g. 320 mm' },
                width: { type: Type.STRING, description: 'Width, e.g. 280 mm' },
                depth: { type: Type.STRING, description: 'Depth, e.g. 340 mm' },
                weight: { type: Type.STRING, description: 'Weight, e.g. 4.8 kg' },
              },
              required: ['height', 'width', 'depth', 'weight'],
            },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 6 technical features',
            },
            keySellingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 persuasive sales counter elevator pitches for promoters',
            },
            promoterPitchHook: {
              type: Type.STRING,
              description: 'One punchy greeting hook for walk-in store customers',
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Recipe or dish name' },
                  prepTime: { type: Type.STRING, description: 'e.g. 15 mins' },
                  cookingMode: { type: Type.STRING, description: 'e.g. 180°C Air Fry / Medium Pulse / Bake mode' },
                  imageKeywords: { type: Type.STRING, description: 'Food description for imagery' },
                },
                required: ['name', 'prepTime', 'cookingMode', 'imageKeywords'],
              },
              description: '4 to 6 dishes that can be prepared using this exact model',
            },
            officialWebsiteQuery: {
              type: Type.STRING,
              description: 'Official brand portal search query or URL reference',
            },
            youtubeSearchQuery: {
              type: Type.STRING,
              description: 'Recommended YouTube video search query for demonstrations',
            },
          },
          required: [
            'name',
            'modelNumber',
            'brand',
            'category',
            'mrp',
            'sellingPrice',
            'power',
            'capacity',
            'warranty',
            'dimensions',
            'features',
            'keySellingPoints',
            'promoterPitchHook',
            'recipes',
            'youtubeSearchQuery',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Product Intel Error:', error);
    res.status(500).json({ error: error.message || 'Error generating product intel' });
  }
});

// JSON fallback for any unhandled /api/* route to prevent returning HTML
app.all('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Global JSON error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Vite server middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SALES Promoters Hub running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
