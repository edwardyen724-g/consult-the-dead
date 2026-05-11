const DOMAIN_SILHOUETTES = {
  science: {
    clipPath: 'polygon(50% 4%, 89% 24%, 89% 76%, 50% 96%, 11% 76%, 11% 24%)',
  },
  strategy: {
    clipPath: 'polygon(10% 18%, 54% 8%, 94% 50%, 54% 92%, 10% 82%, 32% 50%)',
  },
  art: {
    clipPath: 'polygon(16% 10%, 68% 8%, 92% 28%, 90% 62%, 70% 92%, 28% 96%, 8% 70%, 10% 30%)',
  },
  governance: {
    clipPath: 'polygon(50% 4%, 80% 12%, 96% 34%, 92% 68%, 70% 94%, 30% 94%, 8% 68%, 4% 34%, 20% 12%)',
  },
  computing: {
    clipPath: 'polygon(12% 8%, 88% 8%, 94% 18%, 94% 82%, 88% 92%, 12% 92%, 6% 82%, 6% 18%)',
  },
};

function getDomainSilhouetteStyle(domainCategory) {
  return DOMAIN_SILHOUETTES[domainCategory] || DOMAIN_SILHOUETTES.computing;
}

export { DOMAIN_SILHOUETTES, getDomainSilhouetteStyle };
