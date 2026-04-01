import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions legales",
  description: "Mentions legales du site calculatrice.arthurp.fr",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border p-6 sm:p-8" style={{ background: "var(--surface)", borderColor: "var(--border-color)" }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Mentions legales</h1>

        <section className="mt-6 space-y-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          <p>
            Site: calculatrice.arthurp.fr
          </p>
          <p>
            Proprietaire et editeur: Arthur P.
          </p>
          <p>
            Contact principal: <a href="https://contact.arthurp.fr" className="hover:underline">contact.arthurp.fr</a>
          </p>
          <p>
            Email: <a href="mailto:contact@arthurp.fr" className="hover:underline">contact@arthurp.fr</a>
          </p>
          <p>
            Hebergement: infrastructure auto-hebergee sur Proxmox.
          </p>
        </section>
      </div>
    </main>
  );
}
