class RecipeAPI {
    constructor() {
        this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
    }

    async getInitialRecipes() {
        try {
            const response = await fetch(`${this.baseUrl}/search.php?s=`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error('Error fetching initial recipes:', error);
            throw error;
        }
    }

    async searchMeals(query) {
        try {
            const response = await axios.get(`${this.baseUrl}/search.php?s=${query}`);
            return response.data.meals;
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    }

    async getRandomMeal() {
        try {
            const response = await axios.get(`${this.baseUrl}/random.php`);
            return response.data.meals[0];
        } catch (error) {
            console.error('Failed to fetch random recipe:', error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await axios.get(`${this.baseUrl}/categories.php`);
            return response.data.categories;
        } catch (error) {
            console.error('Error retrieving categories:', error);
            throw error;
        }
    }

    async getMealsByCategory(category) {
        try {
            const response = await axios.get(`${this.baseUrl}/filter.php?c=${category}`);
            return response.data.meals;
        } catch (error) {
            console.error('Error fetching recipes by category:', error);
            throw error;
        }
    }

    async getMealById(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/lookup.php?i=${id}`);
            return response.data.meals[0];
        } catch (error) {
            console.error('Error retrieving recipe details:', error);
            throw error;
        }
    }
}