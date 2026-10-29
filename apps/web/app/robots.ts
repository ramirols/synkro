import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://synkro.velyonsoft.com";

  return {
    rules: [
      {
        userAgent: "*",
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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

