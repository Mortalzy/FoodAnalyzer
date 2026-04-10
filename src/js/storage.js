export function saveFoodItems(items) {
    localStorage.setItem('foodItems', JSON.stringify(items));
}

export function loadFoodItems() {
    const saved = localStorage.getItem('foodItems');

    if (!saved) return [];

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error('Ошибка загрузки foodItems:', error);
        return [];
    }
}

export function saveUserProfile(profile) {
    localStorage.setItem('foodUserProfile', JSON.stringify(profile));
}

export function loadUserProfile(defaultProfile) {
    const saved = localStorage.getItem('foodUserProfile');

    if (!saved) return defaultProfile;

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error('Ошибка загрузки foodUserProfile:', error);
        return defaultProfile;
    }
}