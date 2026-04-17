export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Consult The Dead",
    url: "https://www.consultthedead.com",
    description:
      "Multi-framework decision support using cognitive frameworks extracted from historical figures via the Critical Decision Method.",
    sameAs: ["https://github.com/edwardyen724-g/consult-the-dead"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// WebAppJsonLd removed 2026-04-18 — will be reintroduced when the new Agora ships at /agora.
// Previously pointed to agora.consultthedead.com which hosts the hidden company-builder.
export function WebAppJsonLd() {
  return null;
}

export function FAQJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is this different from asking ChatGPT to roleplay as a historical figure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We don't use persona prompts. Each framework is extracted using the Critical Decision Method (CDM) — the same methodology NASA uses to study expert decision-making. Frameworks are built from documented historical incidents and real decisions, not personality imitation.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Critical Decision Method?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Critical Decision Method is a cognitive task analysis technique developed for studying expert decision-making in high-stakes environments. It involves analyzing documented incidents to extract the cues experts noticed, the mental models they applied, and the decision patterns they followed.",
        },
      },
      {
        "@type": "Question",
        name: "Why use multiple frameworks instead of just one?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The value isn't in any single framework's answer — it's where they disagree. When Machiavelli says 'seize leverage now' and Marie Curie says 'you don't have enough evidence yet,' that tension reveals your blind spots. The convergence synthesis then shows where they agree, giving you a high-confidence signal.",
        },
      },
      {
        "@type": "Question",
        name: "What is AI trendslop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Trendslop is a term coined in a 2026 Harvard Business Review study that found all major AI models cluster around the same generic, buzzword-heavy strategic advice. Consult The Dead is designed as the opposite: structured disagreement from genuinely different reasoning frameworks.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
