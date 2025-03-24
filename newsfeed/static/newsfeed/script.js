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
    let query = "Today"; // Default query

    nextButton.textContent = "Next";
    nextButton.classList.add("next-button");
    nextButton.addEventListener("click", () => fetchNews(query, currentPage + 1));

    function fetchNews(query, page = 1) {
        const url = "/api/news";  // Backend API endpoint
        const params = new URLSearchParams({
            q: query,
            sortBy: "popularity",
            language: "en",
            pageSize: 10,
            page: page,
        });
        if (page === 1) {
            tweetsContainer.innerHTML = "";  // Reset the container if it's the first page
        }
        current_feed_title.innerHTML = `Showing news for: ${query}`;

        // Show preloader while fetching data
        preloader.style.display = "block";

        fetch(`${url}?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                totalResults = data.totalResults;  // Get the total number of results
                displayNews(data.articles);
                currentPage = page;

                // Show/hide the next button based on total results and current page
                if (currentPage * 10 >= totalResults) {
                    nextButton.style.display = "none";  // Hide "Next" if there are no more results
                } else {
                    nextButton.style.display = "block";  // Show "Next" if there are more results
                }

                // Hide preloader once data is loaded
                preloader.style.display = "none";
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                preloader.style.display = "none"; // Hide preloader in case of error
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
                <p>${article.content}</p>
                ${article.urlToImage ? `
                <div class="image-wrapper">
                    <div class="loader"></div>
                    <img src="${article.urlToImage}" alt="News Image" />
                </div>` : ""}
                <p><strong>Source:</strong> ${article.source.name}</p>
                <p><strong>Published At:</strong> ${new Date(article.publishedAt).toLocaleString()}</p>
            `;
            tweetsContainer.appendChild(articleElement);

            // Add image load event
            const img = articleElement.querySelector('img');
            if (img) {
                img.onload = () => {
                    // Remove the blur effect and loader once image is fully loaded
                    img.classList.add('loaded');
                    const loader = articleElement.querySelector('.loader');
                    loader.style.display = 'none';
                };
            }
        });
    }

    searchButton.addEventListener("click", () => {
        query = searchInput.value.trim();
        if (query) {
            currentPage = 1;  // Reset page to 1 when new search is done
            fetchNews(query, currentPage);
        }
    });

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            query = category;  // Set the query to the selected category
            currentPage = 1;  // Reset page to 1 when category is changed
            fetchNews(query, currentPage);
        });
    });

    // Load default news on page load
    fetchNews(query);
});
