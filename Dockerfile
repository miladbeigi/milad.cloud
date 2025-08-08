# Use nginx to serve the pre-built static site
FROM nginx:alpine

# Copy the pre-built static files
COPY website/public/ /usr/share/nginx/html/

# Copy a custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
