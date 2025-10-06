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

<!--


<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Blog - Timon Jörns</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="Timon Jörns - Architektur und Stadtplanung." />
  <meta name="keywords" content="Timon Jörns, Blog, Architektur, Stadtplanung, Projekte" />
  <meta name="author" content="Timon Jörns" />
  <meta name="robots" content="index, follow" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fff'/><text x='50' y='68' font-size='72' text-anchor='middle' fill='%23000' font-family='Arial, Helvetica, sans-serif'>T</text></svg>" />
  
  <!-- Preload critical resources -->
  <link rel="preload" href="../css/style.css" as="style" />
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;300;400;500;600;700&display=swap" as="style" />
  
  <link rel="stylesheet" href="../css/style.css" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <main class="article">
    <header class="article-header">
      <div class="article-title">
        <a href="../index.html">← Zurück</a>
      </div>
      <h1>Blog Titel</h1>
      <div class="article-meta">5. Oktober 2025</div>
    </header>

    <article class="article-body">
      <!-- Introduction -->
      <p style="font-size: 1.2rem; font-weight: 300; line-height: 1.8; margin-bottom: 40px; opacity: 0.85;">
        Mit Grasshopper und Rhino haben wir einen Parametrischen Lampenschirm entworfen. Dieser lässt sich variabel gestalten und
        mit einem Lastercutter oder Schneideplotter produzieren.
      </p>

      <!-- First section with float image -->
      <figure class="float float-right">
        <img src="../assets/images/parameticLamp.png" alt="Beispielbild" />
        <figcaption>Lampenschirm Typ 03: Klein & Rund</figcaption>
      </figure>

      <h2>Erste Überschrift</h2>
      
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
        ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>

      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
        mollit anim id est laborum.
      </p>

      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae 
        dicta sunt explicabo.
      </p>

      <!-- Clear float before next section -->
      <div class="clear-block"></div>

      <h2>Zweite Überschrift</h2>

      <p>
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur 
        magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem 
        ipsum quia dolor sit amet, consectetur, adipisci velit.
      </p>

      <!-- Full width image -->
      <figure>
        <img src="../assets/images/Cover_v01.png" alt="Großes Beispielbild" />
        <figcaption>Ein größeres Bild in voller Breite</figcaption>
      </figure>

      <p>
        Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat 
        voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit 
        laboriosam, nisi ut aliquid ex ea commodi consequatur?
      </p>

      <!-- Left float image -->
      <figure class="float float-left">
        <img src="../assets/images/siteplan.png" alt="Weiteres Beispiel" />
        <figcaption>Bild mit linksbündigem Float</figcaption>
      </figure>

      <h2>Dritte Überschrift</h2>

      <p>
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae 
        consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et 
        accusamus et iusto odio dignissimos ducimus.
      </p>

      <p>
        Qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias 
        excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia 
        deserunt mollitia animi, id est laborum et dolorum fuga.
      </p>

      <p>
        Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta 
        nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, 
        omnis voluptas assumenda est, omnis dolor repellendus.
      </p>

      <!-- Clear float -->
      <div class="clear-block"></div>

      <h2>Fazit</h2>

      <p>
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet 
        ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur 
        a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis 
        doloribus asperiores repellat.
      </p>

      <p style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(128, 128, 128, 0.2);">
        <a href="../index.html">← Zurück zur Hauptseite</a>
      </p>
    </article>
  </main>
</body>
</html>



-->