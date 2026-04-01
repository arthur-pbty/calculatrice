"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════ */

/** Entrée de l'historique des calculs */
interface HistoryEntry {
  expression: string;
  result: string;
  steps?: string[];
  timestamp: number;
}

/* ══════════════════════════════════════════════
   Constantes
   ══════════════════════════════════════════════ */

const HISTORY_KEY = "calc-history";
const THEME_KEY = "calc-theme";
const MAX_HISTORY = 50;

/* ══════════════════════════════════════════════
   Utilitaires mathématiques
   ══════════════════════════════════════════════ */

/** Calcule la factorielle d'un entier positif */
function factorial(n: number): number {
  if (n < 0) throw new Error("Factorielle non définie pour les nombres négatifs");
  if (n > 170) throw new Error("Nombre trop grand pour la factorielle");
  if (!Number.isInteger(n)) throw new Error("La factorielle nécessite un entier");
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Évalue une expression mathématique de manière sécurisée.
 * Retourne le résultat et les étapes de calcul.
 */
function evaluateExpression(expr: string): { result: number; steps: string[] } {
  const steps: string[] = [];
  let processed = expr;

  // Étape 1 : Remplacer les constantes
  if (processed.includes("π") || processed.includes("e")) {
    processed = processed.replace(/π/g, `(${Math.PI})`);
    // Remplacer 'e' seulement quand c'est la constante (pas dans 'exp' etc.)
    processed = processed.replace(/(?<![a-zA-Z])e(?![a-zA-Z0-9.])/g, `(${Math.E})`);
    steps.push(`Constantes remplacées : ${processed}`);
  }

  // Étape 2 : Remplacer les opérateurs visuels
  processed = processed.replace(/×/g, "*").replace(/÷/g, "/");

  // Étape 3 : Traiter les factorielles (ex: 5!)
  const factRegex = /(\d+)!/g;
  let match;
  while ((match = factRegex.exec(processed)) !== null) {
    const n = parseInt(match[1]);
    const result = factorial(n);
    processed = processed.replace(match[0], result.toString());
    steps.push(`${n}! = ${result}`);
  }

  // Étape 4 : Traiter les fonctions scientifiques
  const funcMap: Record<string, (x: number) => number> = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log10,
    ln: Math.log,
    sqrt: Math.sqrt,
    "√": Math.sqrt,
  };

  for (const [name, fn] of Object.entries(funcMap)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escapedName}\\(([^()]+)\\)`, "g");
    let funcMatch;
    while ((funcMatch = regex.exec(processed)) !== null) {
      const inner = funcMatch[1];
      // Évaluer l'expression interne d'abord
      const innerResult = safeEval(inner);
      const funcResult = fn(innerResult);
      processed = processed.replace(funcMatch[0], `(${funcResult})`);
      steps.push(`${name}(${inner}) = ${formatNumber(funcResult)}`);
      regex.lastIndex = 0; // Recommencer la recherche
    }
  }

  // Étape 5 : Traiter les puissances (^)
  processed = processed.replace(/\^/g, "**");

  // Étape 6 : Évaluer l'expression finale
  steps.push(`Expression finale : ${processed}`);
  const result = safeEval(processed);

  // Vérifier les erreurs
  if (!isFinite(result)) {
    if (isNaN(result)) throw new Error("Résultat indéfini");
    throw new Error("Division par zéro");
  }

  return { result, steps };
}

/** Évalue une expression arithmétique de manière sécurisée (sans eval) */
function safeEval(expr: string): number {
  // Vérifier que l'expression ne contient que des caractères autorisés
  const sanitized = expr.replace(/\s/g, "");
  if (!/^[0-9+\-*/().e]+$/i.test(sanitized)) {
    throw new Error("Expression invalide");
  }
  // Utiliser Function au lieu d'eval pour un scope isolé
  try {
    const fn = new Function(`"use strict"; return (${sanitized});`);
    return fn();
  } catch {
    throw new Error("Expression invalide");
  }
}

/** Formate un nombre pour l'affichage */
function formatNumber(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) {
    return n.toString();
  }
  // Arrondir à 10 décimales max pour éviter les erreurs de flottant
  const rounded = parseFloat(n.toPrecision(12));
  if (Math.abs(rounded) < 1e-10 && rounded !== 0) {
    return rounded.toExponential(4);
  }
  if (Math.abs(rounded) >= 1e15) {
    return rounded.toExponential(4);
  }
  return rounded.toString();
}

/* ══════════════════════════════════════════════
   Composant principal : Calculator
   ══════════════════════════════════════════════ */

export default function Calculator() {
  // ── État ──
  const [expression, setExpression] = useState(""); // Expression en cours
  const [result, setResult] = useState(""); // Résultat calculé
  const [error, setError] = useState(""); // Message d'erreur
  const [steps, setSteps] = useState<string[]>([]); // Étapes de calcul
  const [showSteps, setShowSteps] = useState(false); // Afficher les étapes
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  }); // Historique
  const [showHistory, setShowHistory] = useState(false); // Panneau historique visible
  const [isScientific, setIsScientific] = useState(false); // Mode scientifique
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "dark") return true;
      if (savedTheme === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  }); // Thème sombre
  const [copied, setCopied] = useState(false); // Feedback copie
  const [lastKey, setLastKey] = useState(""); // Dernière touche pressée (feedback visuel)

  const displayRef = useRef<HTMLDivElement>(null);

  // ── Synchroniser la classe de thème avec l'état courant ──
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // ── Sauvegarder l'historique dans localStorage ──
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // localStorage non disponible
    }
  }, [history]);

  // ── Basculer le thème ──
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, "light");
      }
      return next;
    });
  }, []);

  // ── Ajouter un caractère à l'expression ──
  const append = useCallback((value: string) => {
    setError("");
    setResult("");
    setSteps([]);
    setShowSteps(false);
    setExpression((prev) => prev + value);
  }, []);

  // ── Effacer tout ──
  const clear = useCallback(() => {
    setExpression("");
    setResult("");
    setError("");
    setSteps([]);
    setShowSteps(false);
  }, []);

  // ── Supprimer le dernier caractère ──
  const backspace = useCallback(() => {
    setError("");
    setExpression((prev) => {
      // Vérifier si on doit supprimer un mot-clé entier (sin(, cos(, etc.)
      const keywords = ["sin(", "cos(", "tan(", "log(", "ln(", "sqrt(", "√("];
      for (const kw of keywords) {
        if (prev.endsWith(kw)) {
          return prev.slice(0, -kw.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, []);

  // ── Calculer le résultat ──
  const calculate = useCallback(() => {
    if (!expression.trim()) return;

    try {
      const { result: numResult, steps: calcSteps } = evaluateExpression(expression);
      const formatted = formatNumber(numResult);
      setResult(formatted);
      setSteps(calcSteps);
      setError("");

      // Ajouter à l'historique
      const entry: HistoryEntry = {
        expression,
        result: formatted,
        steps: calcSteps,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de calcul");
      setResult("");
      setSteps([]);
    }
  }, [expression]);

  // ── Copier le résultat ──
  const copyResult = useCallback(async () => {
    const textToCopy = result || expression;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [result, expression]);

  // ── Effacer l'historique ──
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
  }, []);

  // ── Charger une entrée de l'historique ──
  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setSteps(entry.steps || []);
    setError("");
  }, []);

  // ── Raccourcis clavier ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si un input est focus
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;
      setLastKey(key);
      setTimeout(() => setLastKey(""), 150);

      // Chiffres et opérateurs
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        append(key);
      } else if (key === "+" || key === "-") {
        e.preventDefault();
        append(key);
      } else if (key === "*") {
        e.preventDefault();
        append("×");
      } else if (key === "/") {
        e.preventDefault();
        append("÷");
      } else if (key === ".") {
        e.preventDefault();
        append(".");
      } else if (key === "(" || key === ")") {
        e.preventDefault();
        append(key);
      } else if (key === "^") {
        e.preventDefault();
        append("^");
      } else if (key === "!" ) {
        e.preventDefault();
        append("!");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        calculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (key === "Escape" || key === "Delete") {
        e.preventDefault();
        clear();
      } else if (key === "c" && (e.ctrlKey || e.metaKey)) {
        // Ctrl+C copie le résultat
        if (result) {
          e.preventDefault();
          copyResult();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [append, calculate, backspace, clear, copyResult, result]);

  // ── Scroll automatique de l'affichage ──
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  /* ════════════════════════════════════════════
     Boutons de la calculatrice
     ════════════════════════════════════════════ */

  // Boutons du mode simple
  const simpleButtons = [
    { label: "C", action: clear, style: "calc-btn-clear" },
    { label: "(", action: () => append("("), style: "calc-btn-op" },
    { label: ")", action: () => append(")"), style: "calc-btn-op" },
    { label: "÷", action: () => append("÷"), style: "calc-btn-op" },
    { label: "7", action: () => append("7"), style: "calc-btn-num" },
    { label: "8", action: () => append("8"), style: "calc-btn-num" },
    { label: "9", action: () => append("9"), style: "calc-btn-num" },
    { label: "×", action: () => append("×"), style: "calc-btn-op" },
    { label: "4", action: () => append("4"), style: "calc-btn-num" },
    { label: "5", action: () => append("5"), style: "calc-btn-num" },
    { label: "6", action: () => append("6"), style: "calc-btn-num" },
    { label: "−", action: () => append("-"), style: "calc-btn-op" },
    { label: "1", action: () => append("1"), style: "calc-btn-num" },
    { label: "2", action: () => append("2"), style: "calc-btn-num" },
    { label: "3", action: () => append("3"), style: "calc-btn-num" },
    { label: "+", action: () => append("+"), style: "calc-btn-op" },
    { label: "⌫", action: backspace, style: "calc-btn-clear" },
    { label: "0", action: () => append("0"), style: "calc-btn-num" },
    { label: ".", action: () => append("."), style: "calc-btn-num" },
    { label: "=", action: calculate, style: "calc-btn-equal" },
  ];

  // Boutons scientifiques supplémentaires
  const scientificButtons = [
    { label: "sin", action: () => append("sin("), style: "calc-btn-sci" },
    { label: "cos", action: () => append("cos("), style: "calc-btn-sci" },
    { label: "tan", action: () => append("tan("), style: "calc-btn-sci" },
    { label: "π", action: () => append("π"), style: "calc-btn-sci" },
    { label: "log", action: () => append("log("), style: "calc-btn-sci" },
    { label: "ln", action: () => append("ln("), style: "calc-btn-sci" },
    { label: "√", action: () => append("sqrt("), style: "calc-btn-sci" },
    { label: "e", action: () => append("e"), style: "calc-btn-sci" },
    { label: "x²", action: () => append("^2"), style: "calc-btn-sci" },
    { label: "xⁿ", action: () => append("^"), style: "calc-btn-sci" },
    { label: "n!", action: () => append("!"), style: "calc-btn-sci" },
    { label: "( )", action: () => {
      // Insertion intelligente de parenthèses
      const open = (expression.match(/\(/g) || []).length;
      const close = (expression.match(/\)/g) || []).length;
      append(open > close ? ")" : "(");
    }, style: "calc-btn-sci" },
  ];

  /* ════════════════════════════════════════════
     Rendu
     ════════════════════════════════════════════ */

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 transition-colors duration-300">
      {/* Lien d'accessibilité : aller au contenu principal */}
      <a
        href="#calculatrice"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--primary)] focus:text-white"
      >
        Aller à la calculatrice
      </a>

      {/* ── En-tête ── */}
      <header className="w-full max-w-lg mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-[var(--primary)]">Calc</span>ulatrice en ligne gratuite
          </h1>
          <div className="flex items-center gap-3">
            {/* Icône soleil/lune */}
            <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Basculer le thème"
              title="Basculer thème clair/sombre"
            />
          </div>
        </div>

        {/* Toggle Simple / Scientifique */}
        <div className="mt-4 flex items-center gap-4">
          <div className="mode-toggle relative">
            <div
              className="mode-slider"
              style={{
                transform: isScientific ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              className={!isScientific ? "active" : ""}
              onClick={() => setIsScientific(false)}
            >
              Simple
            </button>
            <button
              className={isScientific ? "active" : ""}
              onClick={() => setIsScientific(true)}
            >
              Scientifique
            </button>
          </div>

          {/* Bouton historique */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: showHistory ? "var(--primary)" : "var(--surface)",
              color: showHistory ? "white" : "var(--muted)",
              border: `1px solid ${showHistory ? "transparent" : "var(--border-color)"}`,
            }}
            title="Historique des calculs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Historique
          </button>
        </div>
      </header>

      {/* ── Corps principal ── */}
      <main
        id="calculatrice"
        className="w-full max-w-lg animate-fade-in"
        style={{ animationDelay: "0.1s" }}
        role="application"
        aria-label="Calculatrice"
      >
        <div
          className="rounded-2xl overflow-hidden transition-shadow duration-300"
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-color)",
          }}
        >
          {/* ── Affichage ── */}
          <div className="calc-display m-3 sm:m-4 p-4 sm:p-5" role="region" aria-label="Écran de la calculatrice">
            {/* Expression en cours */}
            <div
              ref={displayRef}
              className="overflow-x-auto whitespace-nowrap text-right font-mono text-lg sm:text-xl min-h-[28px] custom-scrollbar"
              style={{ color: "var(--muted)" }}
              aria-label="Expression en cours"
              aria-live="polite"
            >
              {expression || <span className="opacity-40">0</span>}
            </div>

            {/* Résultat */}
            <div
              className="text-right font-mono text-3xl sm:text-4xl font-bold mt-2 min-h-[44px] flex items-center justify-end gap-2"
              aria-label={error ? `Erreur : ${error}` : `Résultat : ${result || '0'}`}
              aria-live="assertive"
              role="status"
            >
              {error ? (
                <span className="text-red-500 text-lg sm:text-xl animate-fade-in">{error}</span>
              ) : result ? (
                <span className="animate-fade-in">{result}</span>
              ) : (
                <span className="opacity-20">0</span>
              )}

              {/* Bouton copier */}
              {(result || expression) && (
                <button
                  onClick={copyResult}
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
                  title="Copier le résultat"
                >
                  {copied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Étapes de calcul ── */}
          {steps.length > 0 && result && (
            <div className="mx-3 sm:mx-4 mb-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                style={{ color: "var(--primary)" }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showSteps ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Voir les étapes
              </button>
              {showSteps && (
                <div className="mt-1 p-3 rounded-lg text-xs font-mono space-y-1 animate-fade-in" style={{ background: "var(--display-bg)" }}>
                  {steps.map((step, i) => (
                    <div key={i} style={{ color: "var(--muted)" }}>
                      <span style={{ color: "var(--primary)" }}>→</span> {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Boutons scientifiques ── */}
          {isScientific && (
            <div
              className="grid grid-cols-4 gap-2 px-3 sm:px-4 pb-2 animate-fade-in"
              role="group"
              aria-label="Fonctions scientifiques"
            >
              {scientificButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className={`calc-btn ${btn.style} h-11 text-sm`}
                  aria-label={`Fonction ${btn.label}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Boutons principaux ── */}
          <div
            className="grid grid-cols-4 gap-2 p-3 sm:p-4 pt-2"
            role="group"
            aria-label="Clavier de la calculatrice"
          >
            {simpleButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`calc-btn ${btn.style} h-14 sm:h-16 text-lg ${
                  lastKey === btn.label ? "animate-press" : ""
                }`}
                aria-label={btn.label === "⌫" ? "Supprimer" : btn.label === "C" ? "Tout effacer" : btn.label === "=" ? "Calculer" : btn.label === "−" ? "Moins" : btn.label}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Raccourcis clavier (info) ── */}
        <nav className="mt-3 text-center" aria-label="Informations sur les raccourcis">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            ⌨️ Raccourcis : chiffres, opérateurs, Entrée = calculer, Échap = effacer, Retour = supprimer
          </p>
        </nav>
      </main>

      {/* ── Panneau historique (slide-in) ── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistory(false);
          }}
        >
          {/* Fond semi-transparent */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />

          {/* Panneau */}
          <div
            className="relative w-full max-w-sm h-full overflow-y-auto custom-scrollbar p-5 animate-fade-in"
            style={{
              background: "var(--surface)",
              borderLeft: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Historique</h2>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs px-2 py-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Tout effacer
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  aria-label="Fermer l'historique"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p className="text-sm">Aucun calcul pour l&apos;instant</p>
                <p className="text-xs mt-1 opacity-60">Vos calculs apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={entry.timestamp + "-" + i}
                    className="history-item animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onClick={() => {
                      loadFromHistory(entry);
                      setShowHistory(false);
                    }}
                  >
                    <div className="font-mono text-sm truncate" style={{ color: "var(--muted)" }}>
                      {entry.expression}
                    </div>
                    <div className="font-mono text-lg font-bold truncate">
                      = {entry.result}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--muted)", opacity: 0.6 }}>
                      {new Date(entry.timestamp).toLocaleString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Contenu SEO ── */}
      <section className="mt-10 w-full max-w-3xl space-y-5" aria-labelledby="seo-content-heading">
        <h2 id="seo-content-heading" className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Calculatrice en ligne simple et scientifique
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Cette calculatrice en ligne gratuite permet de faire vos opérations du quotidien et vos calculs plus avances,
          directement depuis votre navigateur. Aucun compte, aucune installation et une interface rapide sur mobile comme
          sur ordinateur.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Le mode simple couvre addition, soustraction, multiplication et division. Le mode scientifique ajoute sin, cos,
          tan, logarithmes, racine carree, puissances, factorielle et constantes pi / e. L&apos;historique est conserve
          localement pour retrouver vos derniers calculs.
        </p>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--surface)" }}>
          <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            Questions frequentes
          </h3>
          <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
            {[
              {
                q: "Comment faire un calcul rapidement ?",
                a: "Saisissez votre expression puis appuyez sur Entree ou sur le bouton =.",
              },
              {
                q: "Puis-je utiliser le clavier ?",
                a: "Oui. Les chiffres et operateurs sont pris en charge. Entree calcule, Echap efface et Retour arriere supprime le dernier caractere.",
              },
              {
                q: "A quoi sert le mode scientifique ?",
                a: "Il ajoute les fonctions avancees: sin, cos, tan, log, ln, racine carree, puissances et factorielle.",
              },
              {
                q: "Est-ce que l'historique est conserve ?",
                a: "Oui, les 50 derniers calculs sont stockes localement dans votre navigateur.",
              },
              {
                q: "Puis-je reutiliser un ancien calcul ?",
                a: "Oui, ouvrez l'historique puis cliquez sur une ligne pour recharger l'expression et le resultat.",
              },
              {
                q: "La calculatrice fonctionne-t-elle sur mobile ?",
                a: "Oui, l'interface est adaptee aux ecrans mobiles et ordinateurs.",
              },
              {
                q: "Dois-je creer un compte ?",
                a: "Non, aucun compte n'est necessaire pour utiliser la calculatrice.",
              },
              {
                q: "Comment contacter le proprietaire du site ?",
                a: "Via contact.arthurp.fr ou par email a contact@arthurp.fr.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--border-color)", background: "var(--background)" }}
              >
                <summary className="cursor-pointer font-medium" style={{ color: "var(--foreground)" }}>
                  {item.q}
                </summary>
                <p className="mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer normal en bas de page ── */}
      <footer className="mt-auto w-full px-3 pt-10 pb-3">
        <div
          className="mx-auto w-full max-w-5xl rounded-2xl border p-4 sm:p-6 backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--surface) 88%, transparent)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <section>
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--foreground)" }}>
                Navigation
              </h2>
              <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label="Navigation du site">
                <Link href="/" className="hover:underline" style={{ color: "var(--muted)" }}>Accueil</Link>
                <a href="https://arthurp.fr/projets" target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--muted)" }}>Projets</a>
                <a href="https://contact.arthurp.fr" target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--muted)" }}>Contact</a>
              </nav>
            </section>

            <section>
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--foreground)" }}>
                Liens
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a href="https://arthurp.fr" target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--muted)" }}>
                  arthurp.fr
                </a>
                <a href="https://github.com/arthur-pbty" target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "var(--muted)" }}>
                  GitHub
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--foreground)" }}>
                Légal
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/mentions-legales" className="hover:underline" style={{ color: "var(--muted)" }}>
                  Mentions légales
                </Link>
                <Link href="/politique-de-confidentialite" className="hover:underline" style={{ color: "var(--muted)" }}>
                  Politique de confidentialité
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--foreground)" }}>
                Contact
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: "var(--muted)" }}>
                <a href="https://contact.arthurp.fr" target="_blank" rel="noreferrer" className="hover:underline">
                  contact.arthurp.fr
                </a>
                <a href="mailto:contact@arthurp.fr" className="hover:underline">
                  contact@arthurp.fr
                </a>
                <p className="text-xs opacity-80">Fait avec ❤️ et auto-hébergé sur Proxmox.</p>
              </div>
            </section>
          </div>

          <div className="mt-6 border-t pt-3 text-center text-xs" style={{ color: "var(--muted)", borderColor: "var(--border-color)" }}>
            © {new Date().getFullYear()} Arthur P. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
