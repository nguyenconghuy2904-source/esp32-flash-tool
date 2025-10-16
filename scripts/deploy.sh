#!/bin/bash

# Deployment script for ESP32 Flash Tool
# This script helps deploy the application to different platforms

echo "🚀 ESP32 Flash Tool Deployment Script"
echo "======================================"

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Set environment variable for API URL
    echo "🔧 Setting environment variables..."
    vercel env add NEXT_PUBLIC_API_URL production
    
    # Deploy
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Vercel deployment completed!"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "📦 Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build the project
    echo "🔨 Building project for Netlify..."
    npm run build
    
    # Deploy
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=out
    
    echo "✅ Netlify deployment completed!"
}

# Function to setup GitHub Pages
setup_github_pages() {
    echo "📦 Setting up GitHub Pages deployment..."
    
    echo "📝 To complete GitHub Pages setup:"
    echo "1. Push your code to GitHub repository"
    echo "2. Go to repository Settings > Pages"
    echo "3. Select 'GitHub Actions' as source"
    echo "4. The workflow will automatically deploy on push to main branch"
    echo ""
    echo "🔧 Don't forget to set your API URL in GitHub repository secrets:"
    echo "   NEXT_PUBLIC_API_URL=https://your-cloudflare-worker.workers.dev"
    
    echo "✅ GitHub Pages setup instructions provided!"
}

# Function to deploy Cloudflare Workers
deploy_workers() {
    echo "📦 Deploying Cloudflare Workers..."
    
    # Navigate to workers directory
    cd cloudflare-workers
    
    # Check if Wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        echo "Installing Wrangler CLI..."
        npm install -g wrangler
    fi
    
    # Install dependencies
    echo "📦 Installing Worker dependencies..."
    npm install
    
    # Deploy the worker
    echo "🚀 Deploying Worker..."
    wrangler deploy
    
    cd ..
    echo "✅ Cloudflare Workers deployment completed!"
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up Cloudflare D1 Database..."
    
    cd cloudflare-workers
    
    # Create database
    echo "📦 Creating D1 database..."
    wrangler d1 create esp32-flash-keys
    
    echo ""
    echo "⚠️  IMPORTANT: Copy the database ID from above and update wrangler.toml"
    echo ""
    echo "After updating wrangler.toml, run:"
    echo "  cd cloudflare-workers"
    echo "  wrangler d1 migrations apply esp32-flash-keys --remote"
    
    cd ..
    echo "✅ Database setup instructions provided!"
}

# Main menu
echo ""
echo "Select deployment option:"
echo "1) Deploy to Vercel"
echo "2) Deploy to Netlify" 
echo "3) Setup GitHub Pages"
echo "4) Deploy Cloudflare Workers"
echo "5) Setup Cloudflare D1 Database"
echo "6) Full setup (Workers + Database)"
echo "q) Quit"
echo ""

read -p "Enter your choice: " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        setup_github_pages
        ;;
    4)
        deploy_workers
        ;;
    5)
        setup_database
        ;;
    6)
        setup_database
        deploy_workers
        ;;
    q|Q)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option. Please try again."
        ;;
esac