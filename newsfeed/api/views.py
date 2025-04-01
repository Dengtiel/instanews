import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from instanews.settings import NEWS_API_KEY  # Ensure this contains the new API token

@csrf_exempt
def get_news(request):
    if request.method == "GET":
        # Get query parameters from frontend
        query = request.GET.get("q", "Today")  # Default query
        categories = request.GET.get("categories", "general,tech")  # Default categories
        from_date = request.GET.get("from", (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"))
        to_date = request.GET.get("to", datetime.now().strftime("%Y-%m-%d"))
        language = request.GET.get("language", "en")  # Default language
        sort_by = request.GET.get("sort", "published_on")  # Default sorting
        limit = request.GET.get("limit", 10)  # Number of results
        page = request.GET.get("page", 1)  # Pagination

        # TheNewsAPI URL
        url = "https://api.thenewsapi.com/v1/news/all"

        # API Request Parameters
        params = {
            "api_token": NEWS_API_KEY,  # Use the secure API key from settings
            "search": query,
            "categories": categories,
            # "published_after": from_date,
            # "published_before": to_date,
            "language": language,
            "sort": sort_by,
            "limit": limit,
            "page": page,
        }

        try:
            # Make request to TheNewsAPI
            response = requests.get(url, params=params)
            data = response.json()
            data['request_params'] = params

            if response.status_code == 200:
                return JsonResponse(data, safe=False)
            else:
                return JsonResponse({
                    "error": data.get("message", "Failed to fetch news"),
                    "request_params": params,
                    "full_response": data,
                    }, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
