from django.urls import path
from .views import index
from .api.views import get_news

urlpatterns = [
    path('', index, name='index'),
    path('api/news', get_news, name='get_news'),
]
