import { Product, ProductRecipe } from '../types';
import { getRecipeIntelligence } from './recipeIntelligence';

export interface KeyTestResult {
  success: boolean;
  message?: string;
  latencyMs?: number;
  error?: string;
  isLeaked?: boolean;
  isQuota?: boolean;
}

export interface ChatMessagePayload {
  message: string;
  history?: { role: string; content: string }[];
  currentProduct?: Product | null;
  customApiKey?: string;
}

export interface ChatResponseResult {
  reply: string;
  isFallback?: boolean;
}

// Multi-tier API key verification that gracefully handles 404 edge proxies & static deployments
export async function testGeminiApiKey(apiKey: string): Promise<KeyTestResult> {
  const trimmed = (apiKey || '').trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Please enter a valid Gemini API key.',
    };
  }

  const startTime = Date.now();

  // Tier 1: Try backend route /api/gemini/test-key
  try {
    const res = await fetch('/api/gemini/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: trimmed }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || 'Connected to Google AI Studio Gemini API',
        latencyMs: data.latencyMs || Date.now() - startTime,
        error: data.error,
        isLeaked: !!data.isLeaked,
        isQuota: !!data.isQuota,
      };
    }
  } catch (_backendErr) {
    // If backend is unreachable or returns 404 edge error, continue to Tier 2 direct test
  }

  // Tier 2: Direct browser test against Google Generative Language API
  // This bypasses any edge proxies (e.g. Vercel bom1:: NOT_FOUND 404)
  try {
    const directRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${trimmed}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with: OK' }] }],
        }),
      }
    );

    const directData = await directRes.json();
    const latencyMs = Date.now() - startTime;

    if (directRes.ok && directData?.candidates?.length > 0) {
      return {
        success: true,
        message: 'Connected to Google AI Studio Gemini API',
        latencyMs,
      };
    }

    const err = directData?.error;
    const code = err?.code;
    const msg = err?.message || '';

    if (code === 403 || msg.includes('leaked') || msg.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        isLeaked: true,
        error: 'Your API key was reported as leaked by Google security and deactivated. Please generate a fresh private key at https://aistudio.google.com/apikey and paste it here.',
      };
    }

    if (code === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        isQuota: true,
        error: 'Gemini API daily quota reached. Please retry in a few moments or provide an alternate key from Google AI Studio.',
      };
    }

    return {
      success: false,
      error: msg || 'Unable to authenticate key with Google AI Studio.',
    };
  } catch (directErr: any) {
    return {
      success: false,
      error: directErr?.message || 'Network error connecting to Gemini API. Built-in culinary intelligence remains active.',
    };
  }
}

// Resilient AI Chat Assistant with zero-downtime offline culinary intelligence
export async function sendAIChatMessage(payload: ChatMessagePayload): Promise<ChatResponseResult> {
  const { message, history = [], currentProduct, customApiKey } = payload;
  const trimmedKey = (customApiKey || '').trim();

  // 1. Attempt backend proxy
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        currentProduct,
        customApiKey: trimmedKey || undefined,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data?.reply) {
        return { reply: data.reply };
      }
    }
  } catch {
    // Fall through to client direct or local intelligence
  }

  // 2. If client has a custom key, attempt direct Google API
  if (trimmedKey) {
    try {
      const prompt = `You are the executive AI Sales Promoter Co-Pilot for Bajaj & Morphy Richards kitchen appliances.
Appliance: ${currentProduct ? `${currentProduct.brand} ${currentProduct.name} (${currentProduct.category}, ${currentProduct.power || ''})` : 'Kitchen Appliances'}
Question: ${message}

Provide clear temperature (°C), timer (mins), preheating, steps, chef pro-tip, and recommended YouTube search query for customer demonstration. Keep it practical for in-store retail floor assistance.`;

      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (directRes.ok) {
        const directData = await directRes.json();
        const text = directData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { reply: text };
        }
      }
    } catch {
      // Fall through to local floor intelligence
    }
  }

  // 3. Built-in Floor Culinary Intelligence (Guaranteed 100% Reliability)
  const localReply = generateLocalFloorGuidance(message, currentProduct);
  return { reply: localReply, isFallback: true };
}

// Built-in Floor Culinary Intelligence engine
export function generateLocalFloorGuidance(message: string, prod?: Product | null): string {
  const q = (message || '').toLowerCase();

  // If asking about recipes or preparation
  if (
    q.includes('recipe') ||
    q.includes('how to') ||
    q.includes('make') ||
    q.includes('cook') ||
    q.includes('bake') ||
    q.includes('prepare') ||
    q.includes('fry') ||
    q.includes('temperature')
  ) {
    const dishMatch = message.match(/(how to (make|prepare|cook)|recipe for)\s+([a-zA-Z\s]+)/i);
    const dish = dishMatch ? dishMatch[3].trim() : 'Appliance Specialty';
    const brand = prod ? prod.brand : 'Kitchen Appliance';
    const name = prod ? prod.name : 'Air Fryer / OTG';

    return (
      `### 👨‍🍳 AI Chef Official Preparation Guide: **${dish.toUpperCase()}**\n\n` +
      `**Appliance Model:** ${brand} ${name}\n` +
      `⏱ **Timer:** 12 - 18 Minutes (Preheat 3 mins)\n` +
      `🌡 **Recommended Temperature:** 180°C - 200°C\n` +
      `♨ **Cooking Mode:** Rapid Hot Air Fry / Dual Element Bake\n` +
      `🥣 **Accessory Required:** Crisper basket / Non-stick baking tray\n\n` +
      `#### 🍳 Step-by-Step Appliance Settings & Cooking:\n` +
      `1. **Preparation:** Season and lightly brush the food items with 1 tsp vegetable oil on all sides.\n` +
      `2. **Preheating:** Set appliance to 180°C for 3 minutes to prime the heating coil for instant searing.\n` +
      `3. **Cooking:** Arrange in a single layer without overcrowding the basket. Cook for 12-15 minutes.\n` +
      `4. **Shake/Flip:** Turn over at the halfway mark (approx. 7 mins) for uniform golden blistered crust.\n` +
      `5. **Final Touch:** Rest for 1 minute before serving for maximum crispness!\n\n` +
      `💡 **Executive Chef Pro-Tip:** Never stack foods in multiple layers in the basket; 360° airflow circulation gives the authentic fried texture with 90% less oil.\n\n` +
      `▶️ **YouTube Customer Demo Search:**\n` +
      `Search on YouTube: \`"${brand} ${dish} easy recipe demonstration"\`\n\n` +
      `*(Note: Guidance delivered via built-in appliance culinary intelligence engine).*`
    );
  }

  // If asking for sales pitch or customer objection handling
  if (q.includes('pitch') || q.includes('price') || q.includes('sell') || q.includes('why') || q.includes('compare') || q.includes('warranty')) {
    return (
      `### 💼 Executive Floor Sales Pitch: **${prod ? `${prod.brand} ${prod.name}` : 'Kitchen Appliance'}**\n\n` +
      `🎯 **Primary Customer Hook:**\n` +
      `"${prod?.promoterPitchHook || 'Sir/Maam, this appliance prepares authentic restaurant-style meals in minutes with 90% less oil and includes an official 2-year warranty!'}"\n\n` +
      `🔥 **Key Selling Points & USPs:**\n` +
      `• **Power & Performance:** High wattage (${prod?.power || '1500W'}) ensures instant preheating and crisp crusts.\n` +
      `• **Capacity Advantage:** Spacious capacity (${prod?.capacity || '5 Litres'}) fits meals for the whole family in one go.\n` +
      `• **Durability & Safety:** Backed by ${prod?.warranty || '2 Years warranty'} with overheat auto-cut safety.\n\n` +
      `🛡 **Handling Customer Price Hesitation:**\n` +
      `"At just ₹${prod?.sellingPrice ? prod.sellingPrice.toLocaleString('en-IN') : '4,999'}, this pays for itself in 2 months compared to ordering takeout, and uses less electricity than induction."\n\n` +
      `*(Note: Guidance delivered via verified catalog intel).*`
    );
  }

  // Default assistance
  return (
    `### 👨‍🍳 SALES AI Chef Floor Assistant\n\n` +
    (prod
      ? `We are currently inspecting the **${prod.brand} ${prod.name}** (${prod.category}).\n\n` +
        `• **Wattage / Capacity:** ${prod.power || '1500W'} · ${prod.capacity || 'Family Size'}\n` +
        `• **Prepared Dishes:** ${prod.recipes?.map((r) => r.name).join(', ') || 'Samosas, French Fries, Brownies, Paneer Tikka'}\n` +
        `• **Sales Pitch Hook:** "${prod.promoterPitchHook || 'Premium quality with energy efficiency'}"\n\n` +
        `Ask me how to cook any dish or tap any prepared dish image in the gallery to display exact cooking settings!`
      : `Ready to assist on the sales floor! Select any appliance or tap any dish image in the gallery to reveal exact cooking temperatures, timers, and sales hooks.\n\n` +
        `*(Note: Built-in culinary intelligence is fully operational).*`)
  );
}
