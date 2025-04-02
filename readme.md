# InstaNews Project Deployment Guide

This guide will walk you through the process of deploying the `InstaNews` project, setting up dependencies, and configuring Nginx with load balancing.

---
# Setting up web servers
The following steps can be repeated for all web servers required for the application. In our case, there are two, so we perform these steps twice, once for each server.

## Step 1: Install Dependencies

1. **Install Python and its dependencies**  
   Install Python, pip, and other necessary development tools.

   ```bash
   sudo apt install python3 python3-pip python3-venv build-essential libpq-dev -y
   ```

2. **Install Git**  
   Install Git to clone the repository.

   ```bash
   sudo apt install git -y
   ```

---

## Step 2: Clone the Repository

Clone the `InstaNews` project from GitHub:

```bash
git clone https://github.com/Dengtiel/instanews-api-.git instanews
cd instanews
```

---

## Step 3: Set Up Python Virtual Environment

1. **Create and activate the virtual environment**  
   This isolates your Python environment to prevent conflicts with global Python packages.

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install all the requirements**  
   Install all the dependencies listed in `requirements.txt`.

   ```bash
   pip install -r requirements.txt
   ```

---

## Step 4: Configure the Environment

1. **Collect Static Files**  
   Run the `collectstatic` command to gather static files into a directory.

   ```bash
   python3 manage.py collectstatic
   ```

2. **Add the API Key**  
   Create and configure a `.env` file in the project directory.

   ```bash
   nano .env
   ```

   Paste your `NEWS_API_KEY` into the `.env` file:

   ```
   NEWS_API_KEY=API_KEY_FROM_THENEWSAPI.COM
   ```
   
   The API key should be obtained from [The News API](https://www.thenewsapi.com/).

---

## Step 5: Start Gunicorn

Start the Gunicorn server in the background:

```bash
nohup gunicorn --workers 3 --bind 0.0.0.0:8000 instanews.wsgi:application > gunicorn.log 2>&1 &
```

---

## Step 6: Ensure Required Ports Are Available

Make sure that ports `8000` (Gunicorn) and `80` (Nginx) are accessible to allow incoming traffic to your application. Adjust firewall rules or cloud security settings as necessary to ensure these ports are open.

---

# Set Up Load Balancing with Nginx

If you want to set up Nginx as a load balancer for multiple Django servers, follow these steps:

### 1. **Update Nginx Configuration for Load Balancing**

Modify the `/etc/nginx/sites-available/instanews` file to define multiple backend servers (Django instances). Add the `upstream` directive to define the backend servers and balance the load.

```nginx
upstream django_backend {
    # Define the backend servers (Django apps)
    server 54.237.193.140:8000;  # First server (Gunicorn on 8000)
    server 44.204.78.242:8000;  # Second server (Gunicorn on 8000)
}

server {
    listen 80;
    server_name ur_server_ip;

    location / {
        proxy_pass http://django_backend;  # Pass requests to the upstream servers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. **Enable Nginx Configuration**

Enable the Nginx configuration by linking it to the `sites-enabled` directory:

```bash
sudo ln -s /etc/nginx/sites-available/instanews /etc/nginx/sites-enabled/
```

This configuration enables load balancing between two backend servers:

- `54.237.193.140:8000` (Gunicorn server)
- `44.204.78.242:8000` (Gunicorn server)

### 3. **Restart Nginx for Load Balancing**

Once you've updated the configuration, restart Nginx to enable load balancing:

```bash
sudo systemctl restart nginx
```

---

## Step 8: Access the Application

Once Nginx is configured and Gunicorn is running, the application should be accessible at:

```
http://ur_server_ip/
```

If you’ve configured load balancing, Nginx will distribute the incoming traffic across the backend servers.

---

## Additional Notes
- <a href="https://youtu.be/BAiQTPfCpmE">InstaNews Demo - Watch on YouTube</a>
- Ensure that you configure your DNS or `server_name` directive in Nginx correctly to point to your actual server IP.
- If you want to set up SSL, consider using **Let's Encrypt** to configure HTTPS for secure communication.
- You can also configure the domains instead of server ip to be accessed in browsers!

