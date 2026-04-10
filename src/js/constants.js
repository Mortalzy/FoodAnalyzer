export const selectors = {
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

    addPhotoInput: '[data-js-add-photo-input]',

    progressRing: '[data-js-progress-ring]',
    progressPercent: '[data-js-progress-percent]',

    loader: '[data-js-loader]',
    deleteAllButton: '[data-js-delete-all-button]',

    addPhotoFormPage: '[data-js-add-photo-page]',
    addPhotoFormPageButton: '[data-js-add-photo-form-page-button]',
    addPhotoButton: '[data-js-add-photo-button]',
    uploadedPhoto: '[data-js-uploaded-photo]',
    photoPlaceholder: '[data-js-photo-placeholder]',
    addPhotoNote: '[data-js-add-photo-note]',

    profilePage: '[data-js-profile-page]',
    profileOpenButton: '[data-js-profile-open-button]',
    profileGender: '[data-js-profile-gender]',
    profileAge: '[data-js-profile-age]',
    profileHeight: '[data-js-profile-height]',
    profileWeight: '[data-js-profile-weight]',
    profileSaveButton: '[data-js-profile-save-button]',
    profileCancelButton: '[data-js-profile-cancel-button]',
};

export const defaultDailyNorm = {
    calories: 2000,
    proteins: 100,
    fats: 70,
    carbs: 250,
};

export const defaultUserProfile = {
    gender: 'male',
    age: 20,
    height: 175,
    weight: 70,
};

export const openRouterConfig = {
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1/chat/completions',
};