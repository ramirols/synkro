import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://synkro.velyonsoft.com";

  return {
    rules: [
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
        disallow: [
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
        ],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot"],
        allow: "/",
        disallow: [
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
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "anthropic-ai"],
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
        disallow: [
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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
