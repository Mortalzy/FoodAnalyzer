export function extractJSON(content) {
    let cleaned = content.replace(/^```json\s*/, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    return cleaned.trim();
}

export function calculateDailyNorm(profile) {
    const { gender, age, height, weight } = profile;

    let bmr = 0;

    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const calories = Math.round(bmr * 1.2);
    const proteins = Math.round((calories * 0.30) / 4);
    const fats = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories * 0.45) / 4);

    return {
        calories,
        proteins,
        fats,
        carbs,
    };
}

export function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}