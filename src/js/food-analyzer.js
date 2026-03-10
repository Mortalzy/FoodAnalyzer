// food-analyzer-openrouter.js
const fs = require('fs');
const path = require('path')


// Конфигурация
const OPENROUTER_CONFIG = {
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1/chat/completions",
};

/**
 * Очищает ответ от маркдаун-разметки и извлекает JSON
 */
function extractJSON(content) {
  let cleaned = content.replace(/^```json\n/, '');
  cleaned = cleaned.replace(/\n```$/, '');
  cleaned = cleaned.trim();
  return cleaned;
}


/**
 * Анализ фото еды с опциональным комментарием
 * @param {string} image64Buffer - Фото в формате Buffer64 
 * @param {string} userComment - опциональный комментарий для уточнения запроса
 */
async function analyzeFoodImage(image64Buffer, userComment = null) {
  try {
    console.log("📸 Анализирую фото еды...");
    console.log("🔄 Использую модель: google/gemma-3-4b-it:free");
    
    if (userComment) {
      console.log(`💬 Комментарий пользователя: "${userComment}"`);
    }
  
    // Формируем базовый запрос
    let analysisPrompt = `Ты — профессиональный диетолог. Проанализируй это блюдо и верни ТОЛЬКО JSON.
    
    ВАЖНО: Верни ТОЛЬКО чистый JSON без markdown-разметки, без пояснений, без \`\`\`json.
    
    {
      "dish_name": "название на русском",
      "weight_g": число (примерный вес порции в граммах),
      "calories": число (ккал),
      "protein_g": число (белки),
      "fat_g": число (жиры),
      "carbs_g": число (углеводы),
      "confidence": "high/medium/low"
    }`;
    
    // Добавляем комментарий пользователя, если он есть
    if (userComment) {
      analysisPrompt += `\n\nДополнительная информация от пользователя: "${userComment}". Учти это при анализе.`;
    }
    
    const response = await fetch(OPENROUTER_CONFIG.baseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image64Buffer}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Модель ${data.model} успешно обработала запрос\n`);
    
    const content = data.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.log("🔄 Прямой парсинг не удался, пробую очистить от markdown...");
      const cleanedContent = extractJSON(content);
      
      try {
        analysis = JSON.parse(cleanedContent);
      } catch (secondError) {
        console.error("❌ Ошибка парсинга даже после очистки:", secondError);
        console.log("📝 Сырой ответ:", content);
        throw new Error("Не удалось распарсить ответ модели");
      }
    }

    console.log("\n✅ Анализ завершён!");
    console.log("🍽️ Блюдо:", analysis.dish_name);
    console.log("⚖️ Вес:", analysis.weight_g, "г");
    console.log("🔥 Калории:", analysis.calories, "ккал");
    console.log("🥩 Белки:", analysis.protein_g, "г");
    console.log("🧈 Жиры:", analysis.fat_g, "г"); 
    console.log("🍚 Углеводы:", analysis.carbs_g, "г");
    console.log("📊 Уверенность:", analysis.confidence);
    
    return analysis;
    
  } catch (error) {
    console.error("❌ Ошибка анализа:", error.message);
    throw error;
  }
}

/**
 * Примеры использования с разными комментариями
 */
async function main() {

  console.log(__dirname)
  const rootDir = path.dirname(__dirname)
  const photoPath = path.join(rootDir, 'food-photos', 'Pelmeni.jpg')
  console.log(photoPath)
  
  if (!fs.existsSync(photoPath)) {
    console.log(`❌ Файл ${photoPath} не найден. Положите фото в папку с программой.`);
    return;
  }
  
  try {
    // Пример 1: Базовый анализ без комментария
    console.log("=".repeat(50));
    console.log("📝 ПРИМЕР 1: Базовый анализ");
    console.log("=".repeat(50));
    await analyzeFoodImage(photoPath);
    
    // Пример 2: С комментарием про диету
    console.log("\n" + "=".repeat(50));
    console.log("📝 ПРИМЕР 2: С комментарием про диету");
    console.log("=".repeat(50));
    await analyzeFoodImage(
      photoPath, 
      "Я на кето-диете, оцени содержание углеводов особенно внимательно"
    );
    
    // Пример 3: С комментарием про размер порции
    console.log("\n" + "=".repeat(50));
    console.log("📝 ПРИМЕР 3: С комментарием про размер порции");
    console.log("=".repeat(50));
    await analyzeFoodImage(
      photoPath, 
      "Это маленькая порция, примерно 200 грамм, скорректируй расчёты"
    );
    
    // Пример 4: С комментарием про способ приготовления
    console.log("\n" + "=".repeat(50));
    console.log("📝 ПРИМЕР 4: С комментарием про способ приготовления");
    console.log("=".repeat(50));
    await analyzeFoodImage(
      photoPath, 
      "Пельмени варёные, сметана 15% жирности, 2 столовые ложки"
    );
    
  } catch (error) {
    console.error("Программа завершилась с ошибкой:", error.message);
  }
}

// Запуск
main();