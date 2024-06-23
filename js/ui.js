class UI {
    constructor() {
        this.recipeResults = document.getElementById('recipeResults');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.randomRecipeBtn = document.getElementById('randomRecipe');
        this.favoriteRecipesBtn = document.getElementById('favoriteRecipes');
        this.toggleThemeBtn = document.getElementById('toggleTheme');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.pagination = document.getElementById('pagination');
        this.modal = new bootstrap.Modal(document.getElementById('recipeModal'));
        this.modalTitle = document.getElementById('recipeModalLabel');
        this.modalBody = document.getElementById('recipeModalBody');
        this.itemsPerPage = 12;
        this.currentPage = 1;
        this.currentRecipes = [];

        this.initNotificationContainer();
    }

    initNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    displayRecipes(recipes, page = 1) {
        this.currentRecipes = recipes;
        this.recipeResults.innerHTML = '';
        this.currentPage = page;
        
        if (!recipes || recipes.length === 0) {
            this.showMessage('No recipes found.', 'error');
            this.pagination.innerHTML = '';
            return;
        }

        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const recipesToShow = recipes.slice(startIndex, endIndex);

        const selectedCategory = this.categoryFilter.value;

        recipesToShow.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe, selectedCategory);
            this.recipeResults.appendChild(recipeCard);
        });

        this.displayPagination(recipes.length, page);
    }

    createRecipeCard(recipe, selectedCategory) {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        // Determinar a categoria a ser exibida
        let displayCategory = recipe.strCategory || selectedCategory;
        if (selectedCategory === 'all') {
            displayCategory = recipe.strCategory || 'Not specified';
        }

        // Verificar se a receita está nos favoritos
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);
        const favoriteClass = isFavorite ? 'active' : '';

        card.innerHTML = `
        <div class="card h-100">
            <img src="${recipe.strMealThumb || 'img/default-meal.jpg'}" class="card-img-top recipe-img" alt="${recipe.strMeal}">
            <div class="card-body">
                <h5 class="card-title">${recipe.strMeal}</h5>
                <p class="card-text">Category: ${displayCategory}</p>
                <button class="btn btn-primary view-recipe" data-id="${recipe.idMeal}">See Recipe</button>
            </div>
            <button class="favorite-btn ${favoriteClass}" data-id="${recipe.idMeal}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

        const viewRecipeBtn = card.querySelector('.view-recipe');
        viewRecipeBtn.addEventListener('click', () => this.showRecipeDetails(recipe.idMeal));

        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => this.toggleFavorite(recipe));

        return card;
    }

    async showRecipeDetails(id) {
        try {
            const recipe = await recipeAPI.getMealById(id);
            this.modalTitle.textContent = recipe.strMeal;
            this.modalBody.innerHTML = this.createRecipeDetailsHTML(recipe);
            this.modal.show();
        } catch (error) {
            this.showMessage('Failed to load recipe details. Please try again.');
        }
    }

    createRecipeDetailsHTML(recipe) {
        const ingredients = this.getIngredients(recipe);
        return `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="img-fluid mb-3">
            <h4>Ingredients:</h4>
            <ul>
                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <h4>Instructions:</h4>
            <p>${recipe.strInstructions}</p>
        `;
    }

    getIngredients(recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push(`${measure.trim()} ${ingredient.trim()}`);
            }
        }
        return ingredients;
    }

    toggleFavorite(recipe) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.findIndex(fav => fav.idMeal === recipe.idMeal);
        
        if (index === -1) {
            favorites.push(recipe);
            this.showMessage(`${recipe.strMeal} Added to favorites!`, 'success');
        } else {
            favorites.splice(index, 1);
            this.showMessage(`${recipe.strMeal} removed from favorites!`);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.updateFavoriteBtn(recipe.idMeal);
    }

    updateFavoriteBtn(recipeId) {
        const favoriteBtn = document.querySelector(`.favorite-btn[data-id="${recipeId}"]`);
        if (favoriteBtn) {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isFavorite = favorites.some(fav => fav.idMeal === recipeId);
            favoriteBtn.classList.toggle('active', isFavorite);
        }
    }

    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        this.notificationContainer.appendChild(notification);

        // Animar a entrada da notificação
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remover a notificação após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    displayPagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        let paginationHTML = '';

        // Botão "Anterior"
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 2 && i <= currentPage + 2)
            ) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
            }
        }

        // Botão "Próximo"
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;

        this.pagination.innerHTML = paginationHTML;
    }

    populateCategoryFilter(categories) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            this.categoryFilter.appendChild(option);
        });
    }

    toggleTheme() {
        const isDarkMode = !document.body.classList.contains('dark-mode');
        this.applyTheme(isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
    }

    loadThemePreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.applyTheme(isDarkMode);
    }

    applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            this.toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }

        // Atualizar a barra de navegação
        const navbar = document.querySelector('.navbar');
        const footer = document.querySelector('footer');
        if (isDarkMode) {
            navbar.classList.remove('navbar-light', 'bg-light');
            navbar.classList.add('navbar-dark', 'bg-dark');
            footer.classList.remove('bg-light', 'final-light');
            footer.classList.add('bg-dark');
            
        } else {
            navbar.classList.remove('navbar-dark', 'bg-dark');
            navbar.classList.add('navbar-light', 'bg-light');
            footer.classList.remove('bg-dark');
            footer.classList.add('bg-light', 'final-light');
        }
    }
}