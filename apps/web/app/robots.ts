
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://synkro.velyonsoft.com";

  const privateRoutes = [
    "/dashboard",
    "/pacientes",
    "/agenda",
    "/sesiones",
    "/documentos",
    "/profesionales",
    "/configuracion",
    "/suscripcion",
    "/admin",
    "/api/",
  ];

  return {
    rules: [
      // 1. Rastreadores generales
      {
        userAgent: "*",
        allow: [
          "/",
          "/psicologos",
          "/centros-psicologicos",
          "/funciones",
          "/precios",
          "/seguridad",
          "/privacidad",
          "/terminos",
          "/libro-de-reclamaciones",
          "/demo",
          "/portal-paciente",
          "/portal-paciente/activar",
          "/iniciar-sesion",
          "/registrarse",
          "/recuperar-contrasena",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: privateRoutes,
      },

      // 2. Buscadores tradicionales (SEO)
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot"],
        allow: "/",
        disallow: privateRoutes,
      },

      // 3. Rastreadores de IA (GEO)
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
        ],
        allow: [
          "/",
          "/psicologos",
          "/centros-psicologicos",
          "/funciones",
          "/precios",
          "/seguridad",
          "/privacidad",
          "/terminos",
          "/libro-de-reclamaciones",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: privateRoutes,
      },

      // 4. Búsquedas de ChatGPT (GEO)
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privateRoutes,
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
