# Timon Jörns - Portfolio Website

A modern, responsive portfolio website for Timon Jörns showcasing architecture and urban planning projects.

## Project Structure

```
timonjoerns.github.io/
├── assets/                    # Static assets
│   ├── images/               # Image files
│   │   ├── Cover_v01.png     # Main portfolio cover image
│   │   ├── Lampe.png         # Lamp project image
│   │   └── X_Lampe.png       # Additional lamp project image
│   └── documents/            # Document files
│       └── Portfolio.pdf     # Portfolio PDF download
├── css/                      # Stylesheets
│   └── style.css            # Main stylesheet
├── js/                       # JavaScript files
│   └── app.js               # Main application logic
├── index.html               # Homepage
├── portfolio.html           # Portfolio access page
├── download-portfolio.html  # Portfolio download handler
├── impressum.html           # Legal/contact information
├── robots.txt               # Search engine directives
├── sitemap.xml              # Site structure for search engines
├── CNAME                    # Custom domain configuration
└── README.md                # This file
```

## Features

- **Responsive Design**: Optimized for both desktop and mobile devices
- **Interactive Animations**: Pixi.js-powered floating elements on desktop
- **Password Protection**: Secure portfolio download with session management
- **SEO Optimized**: Complete meta tags, structured data, and sitemap
- **Performance**: Preloaded critical resources and optimized loading

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties and responsive design
- **JavaScript**: Vanilla JS with Pixi.js for desktop animations
- **GitHub Pages**: Static site hosting

## File Organization Benefits

### Before (Flat Structure)
- All files in root directory
- Mixed file types together
- Difficult to navigate and maintain
- Poor scalability

### After (Organized Structure)
- **Separation of Concerns**: Each file type has its own directory
- **Easy Navigation**: Clear folder structure for quick file location
- **Scalability**: Easy to add new assets, styles, or scripts
- **Maintainability**: Logical organization makes updates simpler
- **Professional Standards**: Follows web development best practices

## Development

The website uses a hybrid approach:
- **Desktop**: Pixi.js canvas with floating interactive elements
- **Mobile**: DOM-based card layout with breathing animations

## Deployment

The site is automatically deployed via GitHub Pages when changes are pushed to the main branch.

## Contact

- **Email**: timon@joerns.info
- **Location**: Hannover, Deutschland
- **Website**: https://timonjoerns.github.io/
