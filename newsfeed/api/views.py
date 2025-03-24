import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from instanews.settings import NEWS_API_KEY

@csrf_exempt
def get_news(request):
    if request.method == "GET":
        # Get query parameters from frontend
        query = request.GET.get("q", "Today")  # Default query
        domains = request.GET.get("domains", "techcrunch.com,thenextweb.com")  # Default domains
        from_date = request.GET.get("from", (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"))  # Start date
        to_date = request.GET.get("to", datetime.now().strftime("%Y-%m-%d"))  # End date
        language = request.GET.get("language", "en")  # Default language
        sort_by = request.GET.get("sortBy", "popularity")  # Default sorting
        page_size = request.GET.get("pageSize", 10)  # Number of results
        page = request.GET.get("page", 1)  # Pagination

        # News API URL
        url = "https://newsapi.org/v2/everything"

        # API Request Parameters
        params = {
            "q": query,
            # "domains": domains,
            "from": from_date,
            # "to": "2025-03-24",
            "language": language,
            "sortBy": sort_by,
            "pageSize": page_size,
            "page": page,
            "apiKey": NEWS_API_KEY,  # Use the secure API key from settings
        }

        try:
            # Make request to NewsAPI.org
            response = requests.get(url, params=params)
            data = response.json()

            if response.status_code == 200:
                data['request_params'] = params
                return JsonResponse(data, safe=False)
            else:
                return JsonResponse({"error": data.get("message", "Failed to fetch news")}, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
