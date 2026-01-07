# GrafxCore

## Overview

GrafxCore is a creative agency website showcasing video editing and graphic design services. The application consists of a Flask backend serving a static HTML/CSS/JavaScript frontend, with Supabase as the database for storing portfolio works, categories, and client inquiries. The site includes a public-facing portfolio, about page, contact form, and an admin panel for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JS**: The frontend is built with vanilla HTML, CSS, and JavaScript (no framework)
- **Page Structure**: Multiple HTML pages (`index.html`, `about.html`, `wpage.html`, `ct.html`, `admin.html`) served from the `client/` directory
- **Styling**: Custom CSS with CSS variables for theming (emerald green primary color scheme)
- **External Libraries**: Font Awesome for icons, Google Fonts (Inter) for typography

### Backend Architecture
- **Flask Server**: Python Flask application (`app.py`) handles routing and API endpoints
- **Routing Strategy**: 
  - Static files served from `client/` directory
  - Clean URL routes (`/home`, `/aboutus`, `/portfolio`, `/contactus`)
  - API endpoints under `/api/` namespace for data operations
- **Authentication**: Simple session-based admin login with hardcoded credentials
- **CORS**: Enabled for all origins to support client-side API calls

### Data Storage
- **Supabase**: PostgreSQL-based backend-as-a-service
- **Tables** (inferred from API usage):
  - `works` - Portfolio items with category associations
  - `categories` - Hierarchical categories with parent-child relationships
  - `inquiries` - Contact form submissions
- **Fallback Strategy**: Client-side localStorage used as fallback when API fails

### Admin Panel
- Session-protected admin interface at `/admin`
- Features: Manage portfolio works, view inquiries, manage categories
- Categories support parent-child hierarchy (e.g., "Poster" under "Graphic Design")

## External Dependencies

### Backend Services
- **Supabase** (`hpozbywseixlfjkmouzu.supabase.co`): Database and authentication backend
  - Used for storing works, categories, and inquiries
  - Connected via `supabase-py` client library

### Python Packages
- `Flask` - Web framework
- `flask-cors` - Cross-origin resource sharing
- `supabase` - Supabase Python client
- `gunicorn` - Production WSGI server
- `python-dotenv` - Environment variable management

### Frontend CDN Dependencies
- Font Awesome 6.5.0 - Icon library
- Google Fonts (Inter) - Typography

### Deployment Configurations
- **Koyeb**: Configured with `Procfile` and `requirements.txt`.
- **Vercel**: `client/vercel.json` with URL rewrites
- **Firebase Hosting**: `client/firebase.json` with rewrites
- **Render**: Configured for Flask app with gunicorn