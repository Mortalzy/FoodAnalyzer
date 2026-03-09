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

        this.items = []
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



