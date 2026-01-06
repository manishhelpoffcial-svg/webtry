# GrafxCore - Creative Agency Website

## Overview

GrafxCore is a creative agency website showcasing graphic design and video editing services. The application consists of a Flask backend serving static HTML/CSS/JS frontend pages, with an admin panel for managing portfolio works and client inquiries. The site includes a homepage, about page, portfolio gallery, contact form, and protected admin dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology**: Vanilla HTML, CSS, and JavaScript (no frontend framework)
- **Styling**: Custom CSS with CSS variables for theming (emerald green brand color scheme)
- **Icons**: Font Awesome 6.5 via CDN
- **Fonts**: Inter font family via Google Fonts
- **Design Pattern**: Multi-page application with separate HTML files for each route

### Backend Architecture
- **Framework**: Flask (Python)
- **Pattern**: Server-side rendering with template strings for login page, static file serving for other pages
- **Authentication**: Session-based admin authentication with hardcoded credentials
- **API Endpoints**: REST endpoints for inquiries and portfolio works

### Data Storage
- **Database**: PostgreSQL with psycopg2 driver
- **Client-side Storage**: localStorage used for portfolio works in the admin panel (legacy approach that may need migration to server-side)
- **Connection**: Environment variable for DATABASE_URL

### Route Structure
- Static pages served from `/client` directory
- URL rewrites configured in `vercel.json` and `firebase.json` for clean URLs
- Admin routes protected by session-based authentication

### Key Pages
| Route | File | Purpose |
|-------|------|---------|
| `/home` | index.html | Homepage with hero and services |
| `/aboutus` | about.html | Company information |
| `/portfolio` | wpage.html | Portfolio gallery with filtering |
| `/contactus` | ct.html | Contact form |
| `/admin` | admin.html | Admin dashboard |
| `/login` | login.html | Admin authentication |

## External Dependencies

### Python Packages
- **Flask 3.1.2**: Web framework
- **psycopg2-binary 2.9.11**: PostgreSQL database adapter
- **Jinja2**: Templating (bundled with Flask)
- **Werkzeug**: WSGI utilities (bundled with Flask)

### CDN Resources
- **Font Awesome 6.5.0**: Icon library
- **Google Fonts (Inter)**: Typography

### Deployment Configurations
- **Vercel**: `vercel.json` with URL rewrites
- **Firebase Hosting**: `firebase.json` with hosting rules

### Database
- PostgreSQL database connection via `DATABASE_URL` environment variable
- Uses `psycopg2` with `RealDictCursor` for dictionary-style row access