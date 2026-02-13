
/**
 * SEO Service to handle dynamic metadata and structured data for Search Engine Optimization.
 * Crucial for ranking on Google search results.
 */
export const updateMetadata = (title: string, description: string, path: string = '', schema?: Record<string, any> | Record<string, any>[]) => {
    // Strengthen Brand Association in Title
    const fullTitle = `${title} | True Harvest Bible App`;
    const domain = 'https://trueharvest.world';
    
    // Handle path safely
    let cleanPath = path;
    if (cleanPath && !cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    const fullUrl = `${domain}${cleanPath}`;

    // Update Document Title
    document.title = fullTitle;

    // Helper to set or create meta tags
    const setMeta = (query: string, content: string, createKey: string, createVal: string) => {
        let element = document.querySelector(query);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(createKey, createVal);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // 1. Standard Meta Tags
    setMeta('meta[name="description"]', description, 'name', 'description');
    
    // Generate relevant keywords based on title
    // Add "True Harvest" variations to every page to capture branded queries
    const baseKeywords = "True Harvest, True Harvest App, True Harvest Bible, True Harvest Songs, Christian App, Online Bible";
    let dynamicKeywords = `${baseKeywords}, ${title}, ${title} Meaning, ${title} Study, Christian Worship`;
    
    setMeta('meta[name="keywords"]', dynamicKeywords, 'name', 'keywords');

    // 2. Open Graph (Facebook/LinkedIn)
    setMeta('meta[property="og:title"]', fullTitle, 'property', 'og:title');
    setMeta('meta[property="og:description"]', description, 'property', 'og:description');
    setMeta('meta[property="og:url"]', fullUrl, 'property', 'og:url');
    setMeta('meta[property="og:type"]', 'website', 'property', 'og:type'); 
    
    // Ensure OG Image exists (static for now, could be dynamic later)
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
        setMeta('meta[property="og:image"]', `${domain}/icons/icon-512.png`, 'property', 'og:image');
    }

    // 3. Twitter Cards
    setMeta('meta[property="twitter:title"]', fullTitle, 'property', 'twitter:title');
    setMeta('meta[property="twitter:description"]', description, 'property', 'twitter:description');
    setMeta('meta[property="twitter:url"]', fullUrl, 'property', 'twitter:url');
    setMeta('meta[property="twitter:card"]', 'summary_large_image', 'property', 'twitter:card');

    // 4. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullUrl);
    
    // 5. Update JSON-LD Structured Data
    const scriptId = 'structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    // Base Organization Schema (Ensure SoftwareApplication persists)
    const baseGraph: Record<string, any>[] = [
        {
          "@type": "Organization",
          "name": "True Harvest",
          "alternateName": ["True Harvest Ministry", "True Harvest App"],
          "url": domain,
          "logo": `${domain}/icons/icon-512.png`,
          "description": "A premium AI-powered digital sanctuary for the Christian community."
        },
        {
          "@type": "WebSite",
          "url": domain,
          "name": "True Harvest",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${domain}/?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "SoftwareApplication",
          "name": "True Harvest",
          "operatingSystem": "Android, iOS, Web",
          "applicationCategory": "ReferenceApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }
    ];

    // If specific schema is passed (like Bible Chapter or Breadcrumbs), add it to the graph
    let graph = [...baseGraph];
    if (schema) {
        if (Array.isArray(schema)) {
            graph = [...graph, ...schema];
        } else {
            graph.push(schema);
        }
    }

    const finalSchema = {
      "@context": "https://schema.org",
      "@graph": graph
    };

    if (script) {
        script.textContent = JSON.stringify(finalSchema);
    } else {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(finalSchema);
        document.head.appendChild(script);
    }
};
