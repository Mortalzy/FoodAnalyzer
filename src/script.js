class FoodAnalyzer {
    selectors = {
        statisticsCaloriesEaten: '[data-js-statistics-calories-eaten]',
        statisticsCaloriesRemain: '[data-js-statistics-calories-remain]',
        statisticsCaloriesNormal: '[data-js-statistics-calories-normal]',

        statisticsProteinsNow: '[data-js-statistics-proteins-now]',
        statisticsProteinsNormal: '[data-js-statistics-proteins-normal]',

        statisticsFatsNow: '[data-js-statistics-fats-now]',
        statisticsFatsNormal: '[data-js-statistics-fats-normal]',

        statisticsCarbohydratesNow: '[data-js-statistics-carbohydrates-now]',
        statisticsCarbohydratesNormal: '[data-js-statistics-carbohydrates-normal]',

        totalEatenFood: '[data-js-total-eaten-foods]',
        foodList: '[data-js-food-list]',

        dishesCalories: '[data-js-dishes-calories]',
        dishesProteins: '[data-js-dishes-proteins]',
        dishesFats: '[data-js-dishes-fats]',
        dishesCarbohydrates: '[data-js-dishes-carbohydrates]',

        addPhotoInput: '[data-js-add-photo-input]'
    }

    constructor() {
        this.statisticsCaloriesEatenElement = document.querySelector(this.selectors.statisticsCaloriesEaten)
        this.statisticsCaloriesRemainElement = document.querySelector(this.selectors.statisticsCaloriesRemain)
        this.statisticsCaloriesNormalElement = document.querySelector(this.selectors.statisticsCaloriesNormal)
        
        this.statisticsProteinsNowElement = document.querySelector(this.selectors.statisticsProteinsNow)
        this.statisticsProteinsNormalElement = document.querySelector(this.selectors.statisticsProteinsNormal)
        
        this.statisticsFatsNowElement = document.querySelector(this.selectors.statisticsFatsNow)
        this.statisticsFatsNormalElement = document.querySelector(this.selectors.statisticsFatsNormal)
        
        this.statisticsCarbohydratesNowElement = document.querySelector(this.selectors.statisticsCarbohydratesNow)
        this.statisticsCarbohydratesNormalElement = document.querySelector(this.selectors.statisticsCarbohydratesNormal)
        
        this.totalEatenFoodElement = document.querySelector(this.selectors.totalEatenFood)
        this.foodList = document.querySelector(this.selectors.foodList)
        
        this.dishesCaloriesElement = document.querySelector(this.selectors.dishesCalories)
        this.dishesProteinsElement = document.querySelector(this.selectors.dishesProteins)
        this.dishesFatsElement = document.querySelector(this.selectors.dishesFats)
        this.dishesCarbohydratesElement = document.querySelector(this.selectors.dishesCarbohydrates)

        this.addPhotoInputElement = document.querySelector(this.selectors.addPhotoInput)

        this.items = []

        this.dailyNorm = {
            calories: 2000,
            proteins: 100,
            fats: 70,
            carbs: 250,
        }

        // OpenRouter конфигурация
        this.openRouterConfig = {
            apiKey: "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",
            baseURL: "https://openrouter.ai/api/v1/chat/completions",
        }

        this.loadFromLocalStorage()
        this.render()
        this.bindEvents()
        
        // Сохраняем ссылку на экземпляр для глобального доступа
        window.foodAnalyzer = this;
    }

    async analyzeFood(imageBase64) {
        try {
            console.log("📸 Анализирую фото еды...");
            
            const prompt = `Ты — профессиональный диетолог. Проанализируй это блюдо и верни ТОЛЬКО JSON.
            (Длина названия блюда не должна превышать 25 символов. Можешь использовать сокращения где это уместно)
            
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

            const response = await fetch(this.openRouterConfig.baseURL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.openRouterConfig.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Food Analyzer"
                },
                body: JSON.stringify({
                    model: "google/gemma-3-4b-it:free",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: imageBase64
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3
                })
            });

            if (response.status === 429) {
                throw new Error("Слишком много запросов. Попробуйте позже или используйте свой API ключ");
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ Модель успешно обработала запрос`);
            
            const content = data.choices[0].message.content;
            
            let analysis;
            try {
                analysis = JSON.parse(content);
            } catch (parseError) {
                console.log("🔄 Прямой парсинг не удался, пробую очистить от markdown...");
                const cleanedContent = this.extractJSON(content);
                analysis = JSON.parse(cleanedContent);
            }

            console.log("\n✅ Анализ завершён!");
            console.log("🍽️ Блюдо:", analysis.dish_name);
            console.log("⚖️ Вес:", analysis.weight_g, "г");
            console.log("🔥 Калории:", analysis.calories, "ккал");
            console.log("🥩 Белки:", analysis.protein_g, "г");
            console.log("🧈 Жиры:", analysis.fat_g, "г"); 
            console.log("🍚 Углеводы:", analysis.carbs_g, "г");
            
            return analysis;
            
        } catch (error) {
            console.error("❌ Ошибка анализа:", error);
            throw error;
        }
    }

    extractJSON(content) {
        let cleaned = content.replace(/^```json\n/, '');
        cleaned = cleaned.replace(/\n```$/, '');
        cleaned = cleaned.replace(/^```\n/, '');
        cleaned = cleaned.replace(/\n```$/, '');
        cleaned = cleaned.trim();
        return cleaned;
    }

    bindEvents() {
        this.addPhotoInputElement.addEventListener('change', async (e) => {
            const selectedFile = e.target.files;

            if(selectedFile.length > 0) {
                const [imageFile] = selectedFile
                const isImageType = imageFile.type.startsWith('image')

                if(isImageType) {
                    try {
                        this.showLoadingIndicator();
                        
                        // Получаем полный data URL фото
                        const imageBase64 = await this.getImage64Buffer(imageFile)
                        
                        // Создаем миниатюру для отображения
                        const thumbnail = await this.createThumbnail(imageFile);
                        
                        // Анализируем фото
                        const analysisResult = await this.analyzeFood(imageBase64)
                        
                        // Добавляем результат вместе с миниатюрой
                        this.addFoodItem({
                            ...analysisResult,
                            thumbnail: thumbnail, // Сохраняем миниатюру
                            fullImage: imageBase64 // Опционально: сохраняем полное фото
                        });
                        
                        this.updateStatistics();
                        
                        console.log('Результат анализа:', analysisResult);
                        
                    } catch(error) {
                        console.error('Ошибка:', error)
                        alert('Ошибка при анализе фото: ' + error.message);
                    } finally {
                        this.hideLoadingIndicator();
                        e.target.value = '';
                    }
                } else {
                    alert('Пожалуйста, выберите изображение');
                }
            }
        });
    }
    
    // Новый метод для создания миниатюры
    createThumbnail(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Устанавливаем размер миниатюры (например, 80x80 пикселей)
                const maxSize = 80;
                let width = img.width;
                let height = img.height;
                
                // Сохраняем пропорции
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Рисуем изображение на canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Получаем data URL миниатюры
                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Качество 70%
                resolve(thumbnailDataUrl);
            };
            
            img.onerror = () => {
                reject(new Error('Ошибка при создании миниатюры'));
            };
            
            // Загружаем изображение
            img.src = URL.createObjectURL(imageFile);
        });
    }
    
    getImage64Buffer(imageFile) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()

            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            
            fileReader.onerror = (error) => {
                reject(new Error('Ошибка чтения файла: ' + error))
            }
            
            fileReader.readAsDataURL(imageFile)
        })
    }

    showLoadingIndicator() {
        let loader = document.querySelector('.food-analyzer-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'food-analyzer-loader';
            loader.innerHTML = 'Анализируем фото... 📸';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                border-radius: 10px;
                z-index: 9999;
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    hideLoadingIndicator() {
        const loader = document.querySelector('.food-analyzer-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    addFoodItem(analysis) {
        this.items.push({
            ...analysis,
            date: new Date().toISOString(),
            id: Date.now(),
            isNew: true,
        });
        this.saveToLocalStorage();
        this.render();
    }

    deleteItem(id) {
    const element = document.querySelector(`[data-id="${id}"]`);
    
    if (element) {
        element.classList.add('food-list__item--removing');

        setTimeout(() => {
            this.items = this.items.filter(item => item.id !== id);
            this.saveToLocalStorage();
            this.render();
        }, 250); // должно совпадать с CSS
    }
}

    updateStatistics() {
        const totals = this.items.reduce((acc, item) => {
            acc.calories += item.calories || 0;
            acc.proteins += item.protein_g || 0;
            acc.fats += item.fat_g || 0;
            acc.carbs += item.carbs_g || 0;
            return acc;
        }, { calories: 0, proteins: 0, fats: 0, carbs: 0 });

        if (this.statisticsCaloriesEatenElement) {
            this.statisticsCaloriesEatenElement.textContent = Math.round(totals.calories);
        }
        
        if (this.statisticsCaloriesRemainElement) {
            const remain = this.dailyNorm.calories - totals.calories;
            this.statisticsCaloriesRemainElement.textContent = Math.max(0, Math.round(remain));
        }
        
        if (this.statisticsCaloriesNormalElement) {
            this.statisticsCaloriesNormalElement.textContent = this.dailyNorm.calories;
        }

        if (this.statisticsProteinsNowElement) {
            this.statisticsProteinsNowElement.textContent = Math.round(totals.proteins);
        }
        if (this.statisticsProteinsNormalElement) {
            this.statisticsProteinsNormalElement.textContent = this.dailyNorm.proteins;
        }

        if (this.statisticsFatsNowElement) {
            this.statisticsFatsNowElement.textContent = Math.round(totals.fats);
        }
        if (this.statisticsFatsNormalElement) {
            this.statisticsFatsNormalElement.textContent = this.dailyNorm.fats;
        }

        if (this.statisticsCarbohydratesNowElement) {
            this.statisticsCarbohydratesNowElement.textContent = Math.round(totals.carbs);
        }
        if (this.statisticsCarbohydratesNormalElement) {
            this.statisticsCarbohydratesNormalElement.textContent = this.dailyNorm.carbs;
        }
    }

    render() {
        this.updateStatistics();

        this.totalEatenFoodElement.textContent = this.items.length
        
        if (this.foodList) {
            if (this.items.length > 0) {
                const sorted = [...this.items].reverse();
                
                const itemsHTML = sorted.map(item => {
                    // Используем миниатюру, если она есть, иначе заглушку
                    const photoHTML = item.thumbnail 
                        ? `<img class="food-card__photo-img" src="${item.thumbnail}" alt="${item.dish_name}">`
                        : '<div class="food-card__photo-placeholder">📸</div>';
                    
                    return `
                    <li class="food-list__item ${item.isNew ? 'food-list__item--new' : ''}" data-id="${item.id}">
                        <article class="food-card">
                            <div class="food-card__photo">
                                ${photoHTML}
                            </div>
                            <div class="food-card__content">
                                <div class="food-card__description">
                                    <p class="food-card__title">${item.dish_name || 'Блюдо'}</p>
                                    <p class="food-card__calories">~<span class="food-card__calories-value">${Math.round(item.calories || 0)}</span> ккал</p>
                                    <div class="food-card__PFC">
                                        <p class="food-card__proteins"><span class="food-card__proteins-value">${Math.round(item.protein_g || 0)}</span> б</p>
                                        <p class="food-card__fats"><span class="food-card__fats-value">${Math.round(item.fat_g || 0)}</span> ж</p>
                                        <p class="food-card__carbohydrates"><span class="food-card__carbohydrates-value">${Math.round(item.carbs_g || 0)}</span> у</p>
                                    </div>
                                </div>
                            </div>
                            <button class="food-card__button-delete" onclick="foodAnalyzer.deleteItem(${item.id})">
                                <img class="food-card__delete-img" src="assets/png-icons/delete-card__icon.svg" alt="delete-card__icon">
                            </button>
                        </article>
                    </li>
                `}).join('');
                
                this.foodList.innerHTML = itemsHTML;
            } else {
                this.foodList.innerHTML = '<li class="food-list__empty">Пока нет добавленных блюд</li>';
            }
        }
        
        if (this.dishesCaloriesElement && this.items.length > 0) {
            const lastItem = this.items[this.items.length - 1];
            this.dishesCaloriesElement.textContent = Math.round(lastItem.calories || 0);
            this.dishesProteinsElement.textContent = Math.round(lastItem.protein_g || 0);
            this.dishesFatsElement.textContent = Math.round(lastItem.fat_g || 0);
            this.dishesCarbohydratesElement.textContent = Math.round(lastItem.carbs_g || 0);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('foodItems', JSON.stringify(this.items));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('foodItems');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                console.error('Ошибка загрузки из localStorage:', e);
                this.items = [];
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new FoodAnalyzer();
});