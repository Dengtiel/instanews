document.addEventListener("DOMContentLoaded", () => {
    const tweetsContainer = document.getElementById("tweets-container");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const categoryButtons = document.querySelectorAll(".category-buttons button");
    const nextButton = document.getElementById("next-button");
    const preloader = document.getElementById("preloader");
    const current_feed_title = document.getElementById("current-feed");
    
    let currentPage = 1;
    let totalResults = 0;
    let currentQuery = "Today";
    let currentCategories = "general,tech";
    const currentSort = "published_on";
    const currentLimit = 10;

    nextButton.textContent = "Next";
    nextButton.classList.add("next-button");
    nextButton.addEventListener("click", () => fetchNews(currentQuery, currentCategories, currentPage + 1));

    function fetchNews(query, categories, page = 1) {
        const url = "/api/news";
        const params = new URLSearchParams({
            q: query,
            categories: categories,
            sort: currentSort,
            language: "en",
            limit: currentLimit,
            page: page,
        });

        if (page === 1) {
            tweetsContainer.innerHTML = "";
        }
        current_feed_title.innerHTML = `Showing news for: ${query} in ${categories}`;
        preloader.style.display = "block";

        fetch(`${url}?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                totalResults = data.meta.found;
                displayNews(data.data);
                currentPage = page;

                if (currentPage * currentLimit < totalResults) {
                    nextButton.style.display = "block";
                } else {
                    nextButton.style.display = "none";
                }
                preloader.style.display = "none";
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                preloader.style.display = "none";
            });
    }

    function displayNews(articles) {
        if (!articles || articles.length === 0) {
            tweetsContainer.innerHTML = "<p>No news found.</p>";
            return;
        }
        articles.forEach(article => {
            const articleElement = document.createElement("div");
            articleElement.classList.add("news-item");
            articleElement.innerHTML = `
                <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                <p>${article.description}</p>
                <p>${article.snippet}</p>
                ${article.image_url ? `
                <div class="image-wrapper">
                    <div class="loader"></div>
                    <img src="${article.image_url}" alt="News Image" />
                </div>` : ""}
                <p><strong>Source:</strong> ${article.source}</p>
                <p><strong>Published At:</strong> ${new Date(article.published_at).toLocaleString()}</p>
                <p><strong>Categories:</strong> ${article.categories.join(', ')}</p>
            `;
            tweetsContainer.appendChild(articleElement);

            const img = articleElement.querySelector('img');
            if (img) {
                img.onload = () => {
                    img.classList.add('loaded');
                    const loader = articleElement.querySelector('.loader');
                    loader.style.display = 'none';
                };
            }
        });
    }

    searchButton.addEventListener("click", () => {
        currentQuery = searchInput.value.trim() || "Today";
        currentPage = 1;
        fetchNews(currentQuery, currentCategories, currentPage);
    });

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentCategories = button.getAttribute("data-category");
            currentPage = 1;
            fetchNews(currentQuery, currentCategories, currentPage);
        });
    });

    // Initial load with default parameters
    fetchNews(currentQuery, currentCategories);
});