import { selectors, defaultDailyNorm, defaultUserProfile, openRouterConfig } from './constants.js';
import { calculateDailyNorm, generateId } from './helpers.js';
import { saveFoodItems, loadFoodItems, saveUserProfile, loadUserProfile } from './storage.js';
import { analyzeFoodRequest } from './api.js';

export class FoodAnalyzer {
    constructor() {
        this.selectors = selectors;

        this.statisticsCaloriesEatenElement = document.querySelector(this.selectors.statisticsCaloriesEaten);
        this.statisticsCaloriesRemainElement = document.querySelector(this.selectors.statisticsCaloriesRemain);
        this.statisticsCaloriesNormalElement = document.querySelector(this.selectors.statisticsCaloriesNormal);

        this.statisticsProteinsNowElement = document.querySelector(this.selectors.statisticsProteinsNow);
        this.statisticsProteinsNormalElement = document.querySelector(this.selectors.statisticsProteinsNormal);

        this.statisticsFatsNowElement = document.querySelector(this.selectors.statisticsFatsNow);
        this.statisticsFatsNormalElement = document.querySelector(this.selectors.statisticsFatsNormal);

        this.statisticsCarbohydratesNowElement = document.querySelector(this.selectors.statisticsCarbohydratesNow);
        this.statisticsCarbohydratesNormalElement = document.querySelector(this.selectors.statisticsCarbohydratesNormal);

        this.totalEatenFoodElement = document.querySelector(this.selectors.totalEatenFood);
        this.foodList = document.querySelector(this.selectors.foodList);

        this.dishesCaloriesElement = document.querySelector(this.selectors.dishesCalories);
        this.dishesProteinsElement = document.querySelector(this.selectors.dishesProteins);
        this.dishesFatsElement = document.querySelector(this.selectors.dishesFats);
        this.dishesCarbohydratesElement = document.querySelector(this.selectors.dishesCarbohydrates);

        this.addPhotoInputElement = document.querySelector(this.selectors.addPhotoInput);

        this.progressRingElement = document.querySelector(this.selectors.progressRing);
        this.progressPercentElement = document.querySelector(this.selectors.progressPercent);

        this.loaderElement = document.querySelector(this.selectors.loader);
        this.deleteAllButtonElement = document.querySelector(this.selectors.deleteAllButton);

        this.addPhotoFormPageElement = document.querySelector(this.selectors.addPhotoFormPage);
        this.addPhotoFormPageButtonElement = document.querySelector(this.selectors.addPhotoFormPageButton);
        this.addPhotoButtonElement = document.querySelector(this.selectors.addPhotoButton);
        this.uploadedPhotoElement = document.querySelector(this.selectors.uploadedPhoto);
        this.photoPlaceholderElement = document.querySelector(this.selectors.photoPlaceholder);
        this.addPhotoNoteElement = document.querySelector(this.selectors.addPhotoNote);

        this.profilePageElement = document.querySelector(this.selectors.profilePage);
        this.profileOpenButtonElement = document.querySelector(this.selectors.profileOpenButton);
        this.profileGenderElement = document.querySelector(this.selectors.profileGender);
        this.profileAgeElement = document.querySelector(this.selectors.profileAge);
        this.profileHeightElement = document.querySelector(this.selectors.profileHeight);
        this.profileWeightElement = document.querySelector(this.selectors.profileWeight);
        this.profileSaveButtonElement = document.querySelector(this.selectors.profileSaveButton);
        this.profileCancelButtonElement = document.querySelector(this.selectors.profileCancelButton);

        this.selectedImageFile = null;
        this.selectedImageBase64 = '';
        this.selectedThumbnail = '';

        this.items = loadFoodItems();
        this.userProfile = loadUserProfile(defaultUserProfile);
        this.dailyNorm = calculateDailyNorm(this.userProfile);
        this.openRouterConfig = openRouterConfig;

        this.render();
        this.bindEvents();

        window.foodAnalyzer = this;
    }

    async analyzeFood(imageBase64) {
        return analyzeFoodRequest(imageBase64, this.openRouterConfig);
    }

    bindEvents() {
        if (this.deleteAllButtonElement) {
            this.deleteAllButtonElement.addEventListener('click', () => this.deleteAllCards());
        }

        if (this.addPhotoFormPageButtonElement) {
            this.addPhotoFormPageButtonElement.addEventListener('click', () => this.showAddPhotoPage());
        }

        if (this.profileOpenButtonElement) {
            this.profileOpenButtonElement.addEventListener('click', () => {
                this.fillProfileForm();
                this.showProfilePage();
            });
        }

        if (this.profileSaveButtonElement) {
            this.profileSaveButtonElement.addEventListener('click', () => this.saveProfileAndUpdateNorm());
        }

        if (this.profileCancelButtonElement) {
            this.profileCancelButtonElement.addEventListener('click', () => this.hideProfilePage());
        }

        if (this.profilePageElement) {
            this.profilePageElement.addEventListener('click', (event) => {
                if (event.target === this.profilePageElement) {
                    this.hideProfilePage();
                }
            });
        }

        if (this.addPhotoInputElement) {
            this.addPhotoInputElement.addEventListener('change', async (e) => {
                const selectedFile = e.target.files;

                if (!selectedFile || selectedFile.length === 0) return;

                const [imageFile] = selectedFile;
                const isImageType = imageFile.type.startsWith('image/');

                if (!isImageType) {
                    alert('Пожалуйста, выберите изображение');
                    e.target.value = '';
                    return;
                }

                this.selectedImageFile = imageFile;

                const objectUrl = URL.createObjectURL(imageFile);

                if (this.uploadedPhotoElement) {
                    this.uploadedPhotoElement.src = objectUrl;
                    this.uploadedPhotoElement.classList.add('is-visible');
                }

                if (this.photoPlaceholderElement) {
                    this.photoPlaceholderElement.classList.add('is-hidden');
                }

                try {
                    this.selectedImageBase64 = await this.getImage64Buffer(imageFile);
                    this.selectedThumbnail = await this.createThumbnail(imageFile);
                } catch (error) {
                    console.error(error);
                    alert('Ошибка подготовки изображения');
                }
            });
        }

        if (this.addPhotoButtonElement) {
            this.addPhotoButtonElement.addEventListener('click', async () => {
                if (!this.selectedImageFile || !this.selectedImageBase64) {
                    alert('Сначала выберите фото');
                    return;
                }

                try {
                    this.showLoadingIndicator();

                    const analysisResult = await this.analyzeFood(this.selectedImageBase64);

                    this.addFoodItem({
                        ...analysisResult,
                        thumbnail: this.selectedThumbnail,
                        fullImage: this.selectedImageBase64,
                        note: this.addPhotoNoteElement ? this.addPhotoNoteElement.value.trim() : ''
                    });

                    this.hideAddPhotoPage();
                    this.resetAddPhotoPage();
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка при анализе фото: ' + error.message);
                } finally {
                    this.hideLoadingIndicator();
                }
            });
        }

        if (this.addPhotoFormPageElement) {
            this.addPhotoFormPageElement.addEventListener('click', (event) => {
                if (event.target === this.addPhotoFormPageElement) {
                    this.hideAddPhotoPage();
                }
            });
        }
    }

    createThumbnail(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const objectUrl = URL.createObjectURL(imageFile);

            img.onload = () => {
                const maxSize = 80;
                let width = img.width;
                let height = img.height;

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

                ctx.drawImage(img, 0, 0, width, height);

                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                URL.revokeObjectURL(objectUrl);
                resolve(thumbnailDataUrl);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Ошибка при создании миниатюры'));
            };

            img.src = objectUrl;
        });
    }

    getImage64Buffer(imageFile) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(new Error('Ошибка чтения файла: ' + error));

            fileReader.readAsDataURL(imageFile);
        });
    }

    showLoadingIndicator() {
        if (this.loaderElement) {
            this.loaderElement.style.display = 'flex';
        }
    }

    hideLoadingIndicator() {
        if (this.loaderElement) {
            this.loaderElement.style.display = 'none';
        }
    }

    showAddPhotoPage() {
        if (this.addPhotoFormPageElement) {
            this.addPhotoFormPageElement.classList.add('is-active');
        }
    }

    hideAddPhotoPage() {
        if (this.addPhotoFormPageElement) {
            this.addPhotoFormPageElement.classList.remove('is-active');
        }
    }

    resetAddPhotoPage() {
        this.selectedImageFile = null;
        this.selectedImageBase64 = '';
        this.selectedThumbnail = '';

        if (this.addPhotoInputElement) {
            this.addPhotoInputElement.value = '';
        }

        if (this.addPhotoNoteElement) {
            this.addPhotoNoteElement.value = '';
        }

        if (this.uploadedPhotoElement) {
            this.uploadedPhotoElement.src = '';
            this.uploadedPhotoElement.classList.remove('is-visible');
        }

        if (this.photoPlaceholderElement) {
            this.photoPlaceholderElement.classList.remove('is-hidden');
        }
    }

    showProfilePage() {
        if (this.profilePageElement) {
            this.profilePageElement.classList.add('is-active');
        }
    }

    hideProfilePage() {
        if (this.profilePageElement) {
            this.profilePageElement.classList.remove('is-active');
        }
    }

    fillProfileForm() {
        if (this.profileGenderElement) this.profileGenderElement.value = this.userProfile.gender;
        if (this.profileAgeElement) this.profileAgeElement.value = this.userProfile.age;
        if (this.profileHeightElement) this.profileHeightElement.value = this.userProfile.height;
        if (this.profileWeightElement) this.profileWeightElement.value = this.userProfile.weight;
    }

    saveProfileAndUpdateNorm() {
        const gender = this.profileGenderElement?.value;
        const age = Number(this.profileAgeElement?.value);
        const height = Number(this.profileHeightElement?.value);
        const weight = Number(this.profileWeightElement?.value);

        if (!gender || !age || !height || !weight) {
            alert('Заполните все поля');
            return;
        }

        this.userProfile = { gender, age, height, weight };
        this.dailyNorm = calculateDailyNorm(this.userProfile);

        saveUserProfile(this.userProfile);
        this.render();
        this.hideProfilePage();
    }

    addFoodItem(analysis) {
        this.items.push({
            ...analysis,
            date: new Date().toISOString(),
            id: generateId(),
            isNew: true,
        });

        saveFoodItems(this.items);
        this.render();
    }

    deleteItem(id) {
        const element = document.querySelector(`[data-id="${id}"]`);

        if (element) {
            element.classList.add('food-list__item--removing');

            setTimeout(() => {
                this.items = this.items.filter(item => item.id !== id);
                saveFoodItems(this.items);
                this.render();
            }, 250);
        }
    }

    deleteAllCards() {
        const isConfirmed = confirm('Are you sure to delete all items?');
        if (!isConfirmed) return;

        this.items = [];
        saveFoodItems(this.items);
        this.render();
    }

    updateProgressRing(eatenCalories) {
        if (!this.progressRingElement || !this.progressPercentElement) return;

        const radius = 70;
        const circumference = 2 * Math.PI * radius;

        const progress = Math.min(eatenCalories / this.dailyNorm.calories, 1);
        const percent = Math.round(progress * 100);

        this.progressRingElement.style.strokeDasharray = circumference;
        this.progressRingElement.style.strokeDashoffset = circumference * (1 - progress);
        this.progressPercentElement.textContent = `${percent}%`;

        if (progress < 0.5) {
            this.progressRingElement.style.stroke = '#8fdda2';
        } else if (progress < 0.85) {
            this.progressRingElement.style.stroke = '#fffd7b';
        } else {
            this.progressRingElement.style.stroke = '#fca590';
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

        this.updateProgressRing(totals.calories);
    }

    render() {
        this.updateStatistics();

        if (this.totalEatenFoodElement) {
            this.totalEatenFoodElement.textContent = this.items.length;
        }

        if (this.foodList) {
            if (this.items.length > 0) {
                const sorted = [...this.items].reverse();

                const itemsHTML = sorted.map(item => {
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

                                <button class="food-card__button-delete" onclick="foodAnalyzer.deleteItem(${item.id})" type="button">
                                    <img class="food-card__delete-img" src="assets/png-icons/delete-card__icon.svg" alt="delete-card__icon">
                                </button>
                            </article>
                        </li>
                    `;
                }).join('');

                this.foodList.innerHTML = itemsHTML;
            } else {
                this.foodList.innerHTML = '<li class="food-list__empty">There are no foods</li>';
            }
        }
    }
}