import { extractJSON } from './helpers.js';

export async function analyzeFoodRequest(imageBase64, config) {
    const prompt = `Ты — профессиональный диетолог. Проанализируй это блюдо и верни ТОЛЬКО JSON.
(Длина названия блюда не должна превышать 25 символов. Можешь использовать сокращения где это уместно)

ВАЖНО: Верни ТОЛЬКО чистый JSON без markdown-разметки, без пояснений, без \`\`\`json.

{
  "dish_name": "название на русском",
  "weight_g": число,
  "calories": число,
  "protein_g": число,
  "fat_g": число,
  "carbs_g": число,
  "confidence": "high/medium/low"
}`;

    const response = await fetch(config.baseURL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Food Analyzer'
        },
        body: JSON.stringify({
            model: 'google/gemma-3-4b-it:free',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: { url: imageBase64 }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.3
        })
    });

    if (response.status === 429) {
        throw new Error('Слишком много запросов. Попробуйте позже или используйте свой API ключ');
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('Пустой ответ от модели');
    }

    try {
        return JSON.parse(content);
    } catch {
        return JSON.parse(extractJSON(content));
    }
}