import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  description: "Politique de confidentialite du site calculatrice.arthurp.fr",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border p-6 sm:p-8" style={{ background: "var(--surface)", borderColor: "var(--border-color)" }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Politique de confidentialite</h1>

        <section className="mt-6 space-y-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          <p>
            Cette application ne requiert pas de compte et ne collecte pas de donnees personnelles cote serveur pour son fonctionnement courant.
          </p>
          <p>
            L&apos;historique de calcul est stocke localement dans votre navigateur (localStorage) pour ameliorer l&apos;experience utilisateur.
          </p>
          <p>
            Vous pouvez supprimer ces donnees a tout moment depuis le bouton &quot;Tout effacer&quot; dans l&apos;historique ou via les reglages de votre navigateur.
          </p>
          <p>
            Pour toute demande, vous pouvez utiliser <a href="https://contact.arthurp.fr" className="hover:underline">contact.arthurp.fr</a> ou <a href="mailto:contact@arthurp.fr" className="hover:underline">contact@arthurp.fr</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
