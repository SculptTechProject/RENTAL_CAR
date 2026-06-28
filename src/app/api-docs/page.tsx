"use client";

import { useEffect } from "react";

// Swagger UI loaded from CDN (avoids React-version peer-dependency issues with
// swagger-ui-react). It renders the spec served at /api/api-docs.
declare global {
  interface Window {
    SwaggerUIBundle?: (config: Record<string, unknown>) => void;
  }
}

const SWAGGER_VERSION = "5.17.14";

export default function ApiDocsPage() {
  useEffect(() => {
    // CSS
    if (!document.getElementById("swagger-ui-css")) {
      const link = document.createElement("link");
      link.id = "swagger-ui-css";
      link.rel = "stylesheet";
      link.href = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui.css`;
      document.head.appendChild(link);
    }

    const render = () => {
      window.SwaggerUIBundle?.({
        url: "/api/api-docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
      });
    };

    // JS bundle
    const existing = document.getElementById("swagger-ui-js");
    if (existing) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.id = "swagger-ui-js";
    script.src = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-bundle.js`;
    script.crossOrigin = "anonymous";
    script.onload = render;
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div id="swagger-ui" />
    </main>
  );
}
