const recipeAPI = new RecipeAPI();
const ui = new UI();

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
ui.searchBtn.addEventListener('click', searchRecipes);
ui.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes();
});
ui.randomRecipeBtn.addEventListener('click', getRandomRecipe);
ui.favoriteRecipesBtn.addEventListener('click', showFavoriteRecipes);
ui.toggleThemeBtn.addEventListener('click', () => ui.toggleTheme());
ui.categoryFilter.addEventListener('change', filterByCategory);
ui.pagination.addEventListener('click', handlePagination);

async function initApp() {
    ui.loadThemePreference();
    try {
        const categories = await recipeAPI.getCategories();
        ui.populateCategoryFilter(categories);

        const initialRecipes = await recipeAPI.getInitialRecipes();
        ui.displayRecipes(initialRecipes);
    } catch (error) {
        ui.showMessage('Error initializing the application. Please reload the page.');
    }
}

async function searchRecipes() {
    const query = ui.searchInput.value.trim();
    if (query === '') return;

    try {
        const recipes = await recipeAPI.searchMeals(query);
        ui.displayRecipes(recipes);
    } catch (error) {
        ui.showMessage('Error fetching recipes. Please try again.');
    }
}

async function getRandomRecipe() {
    try {
        const recipe = await recipeAPI.getRandomMeal();
        ui.displayRecipes([recipe]);
    } catch (error) {
        ui.showMessage('Error retrieving random recipe. Please try again.');
    }
}

function showFavoriteRecipes() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        ui.showMessage('You don\'t have any favorite recipes yet.');
    } else {
        ui.displayRecipes(favorites);
    }
}

async function filterByCategory() {
    const category = ui.categoryFilter.value;
    try {
        let recipes;
        if (category === '') {
            recipes = await recipeAPI.searchMeals('');
        } else {
            recipes = await recipeAPI.getMealsByCategory(category);
        }
        ui.displayRecipes(recipes);
    } catch (error) {
        ui.showMessage('Error filtering recipes. Please try again.');
    }
}

function handlePagination(e) {
    e.preventDefault();
    if (e.target.classList.contains('page-link') && !e.target.parentElement.classList.contains('disabled')) {
        const pageNumber = parseInt(e.target.getAttribute('data-page'));
        ui.displayRecipes(ui.currentRecipes, pageNumber);
        window.scrollTo(0, 0); // Rola para o topo da página
    }
}