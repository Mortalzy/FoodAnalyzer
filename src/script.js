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

        this.ApiUrl = ''

        this.loadFromLocalStorage()

        this.render()

        this.BindEvents()
    }

    async analyzeFood(image64Base) {
        const response = await fetch(`${this.ApiUrl}/analyze`, {
            method: 'POST',
            body: JSON.stringify({image: image64Base})
        })
        return response.json()
    }

    async getPhoto() {
        this.addPhotoInputElement.addEventListener('change', async (e) => {
            const selectedFile = e.target.files;

            if(selectedFile.length > 0) {
                const [imageFile] = selectedFile

                const isImageType = imageFile.type.startsWith('image')

                if(isImageType) {

                    try {
                        const image64Base = await this.getImage64Buffer(imageFile)

                        const analysisResult = await this.analyzeFood(image64Base)

                        console.log(analysisResult);
                        


                    }
                    catch(error) {
                        console.error(error)
                    }
                }

            }
        })

    }
    
    getImage64Buffer(imageFile) {
        return new Promise((resolve) => {
            const fileReader = new FileReader()
            let image64Buffer

            fileReader.onload(() => {
                image64Buffer = fileReader.result
                resolve(image64Buffer)
            })
            fileReader.readAsDataURL(imageFile)
        })
    }

    render() {

    }

    savePhotoToDir() {

    }

    saveToLocalStorage() {

    }

    loadFromLocalStorage() {

    }

    BindEvents() {

    }
}

new FoodAnalyzer()



