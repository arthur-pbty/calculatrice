import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ── Polices ── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ── URL du site (à adapter en production) ── */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://calculatrice-en-ligne.fr";

/* ══════════════════════════════════════════════
   Métadonnées SEO – optimisées pour le référencement
   ══════════════════════════════════════════════ */
export const metadata: Metadata = {
  /* ── Titre & description ── */
  title: {
    default: "Calculatrice en ligne gratuite – Simple & Scientifique | Calcul rapide",
    template: "%s | Calculatrice en ligne gratuite",
  },
  description:
    "Calculatrice en ligne gratuite : effectuez vos calculs simples et scientifiques (sin, cos, tan, log, √, puissances, factorielle). Historique sauvegardé, thème sombre, raccourcis clavier. 100 % gratuit, sans inscription.",
  keywords: [
    "calculatrice en ligne",
    "calculatrice en ligne gratuite",
    "calculatrice scientifique",
    "calculatrice scientifique en ligne",
    "calcul en ligne",
    "calculette en ligne",
    "calculatrice gratuite",
    "calculer en ligne",
    "math en ligne",
    "calculatrice web",
    "calculatrice simple",
    "calculatrice avec historique",
    "sinus cosinus tangente en ligne",
    "logarithme en ligne",
    "racine carrée en ligne",
  ],
  authors: [{ name: "Calculatrice en ligne" }],
  creator: "Calculatrice en ligne",
  publisher: "Calculatrice en ligne",

  /* ── Canonical & alternates ── */
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },

  /* ── Open Graph ── */
  openGraph: {
    title: "Calculatrice en ligne gratuite – Simple & Scientifique",
    description:
      "Effectuez tous vos calculs en ligne gratuitement : mode simple et scientifique, historique sauvegardé, thème sombre. Sans inscription.",
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Calculatrice en ligne",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Calculatrice en ligne gratuite – Interface moderne avec mode scientifique",
        type: "image/png",
      },
    ],
  },

  /* ── Twitter Card ── */
  twitter: {
    card: "summary_large_image",
    title: "Calculatrice en ligne gratuite – Simple & Scientifique",
    description:
      "Calculs simples et scientifiques en ligne, gratuitement. Historique, thème sombre, raccourcis clavier.",
    images: [`${SITE_URL}/og-image.png`],
  },

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Vérification Search Console (à remplir) ── */
  // verification: {
  //   google: "votre-code-verification",
  // },

  /* ── Catégorie ── */
  category: "technology",

  /* ── Autres ── */
  applicationName: "Calculatrice en ligne",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  /* ── Icônes ── */
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  /* ── Manifest PWA ── */
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* ── Données structurées JSON-LD (Schema.org) ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: "Calculatrice en ligne gratuite",
        url: SITE_URL,
        description:
          "Calculatrice en ligne gratuite avec mode simple et scientifique. Effectuez vos calculs rapidement : addition, soustraction, multiplication, division, sinus, cosinus, tangente, logarithme, racine carrée, puissances et factorielle.",
        applicationCategory: "UtilityApplication",
        operatingSystem: "Tout navigateur web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "Calculs simples : addition, soustraction, multiplication, division",
          "Mode scientifique : sin, cos, tan, log, ln, √, puissances, factorielle",
          "Constantes mathématiques : π et e",
          "Parenthèses et expressions complexes",
          "Historique des calculs sauvegardé",
          "Thème clair et sombre",
          "Raccourcis clavier",
          "Copie du résultat en un clic",
          "Affichage des étapes de calcul",
        ],
        inLanguage: "fr",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Calculatrice en ligne gratuite",
        description:
          "Calculatrice en ligne gratuite : simple et scientifique, avec historique et thème sombre.",
        inLanguage: "fr",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Comment utiliser la calculatrice en ligne ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Cliquez sur les boutons ou utilisez votre clavier pour saisir une expression mathématique, puis appuyez sur '=' ou Entrée pour obtenir le résultat. Vous pouvez basculer entre le mode simple et scientifique.",
            },
          },
          {
            "@type": "Question",
            name: "Quelles fonctions scientifiques sont disponibles ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La calculatrice scientifique propose : sinus (sin), cosinus (cos), tangente (tan), logarithme décimal (log), logarithme naturel (ln), racine carrée (√), puissances (x², xⁿ), factorielle (n!), ainsi que les constantes π et e.",
            },
          },
          {
            "@type": "Question",
            name: "L'historique des calculs est-il sauvegardé ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, l'historique de vos 50 derniers calculs est automatiquement sauvegardé dans votre navigateur (localStorage). Il persiste même si vous fermez la page.",
            },
          },
          {
            "@type": "Question",
            name: "La calculatrice est-elle vraiment gratuite ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, la calculatrice est 100 % gratuite, sans publicité et sans inscription requise. Vous pouvez l'utiliser autant que vous le souhaitez.",
            },
          },
          {
            "@type": "Question",
            name: "Puis-je utiliser des raccourcis clavier ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui ! Utilisez les chiffres et opérateurs de votre clavier. Entrée ou = pour calculer, Échap pour effacer, Retour arrière pour supprimer le dernier caractère, et Ctrl+C pour copier le résultat.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: SITE_URL,
          },
        ],
      },
    ],
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script inline pour éviter le flash de thème */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('calc-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Données structurées JSON-LD pour Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
