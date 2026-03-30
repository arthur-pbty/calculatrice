import Calculator from "./components/Calculator";

/**
 * Page principale – Calculatrice en ligne gratuite
 *
 * Le composant Calculator est un composant client qui gère
 * toute la logique de calcul, l'historique et les raccourcis clavier.
 * Le SEO est géré via le layout.tsx (metadata export).
 */
export default function Home() {
  return <Calculator />;
}
