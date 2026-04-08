# Company Builder — Consult The Dead

> Multi-framework decision support, extracted from documented historical incidents. Not a persona. Not a clone.

## What it is

Company Builder is a debate engine. You hand it a decision — a strategy bet, a hiring call, a product trade-off — and several historical-figure decision frameworks analyze it in parallel, surface where they disagree, and converge on a synthesis you can actually use. The point isn't to ask "what would Newton say?" — it's to run your problem through a structured cognitive lens that has been reverse-engineered from how Newton actually made decisions under uncertainty, and then to do the same with several other lenses at once so the disagreements between them become visible.

The frameworks are built using the Critical Decision Method: documented historical incidents are mined for the decision-maker's perceptual cues, the constructs they used to compare options, and the trade-offs they accepted. This is the opposite of persona clones, which scrape speeches, letters, and biographies to mimic a voice. A persona clone tells you what someone might say. A framework tells you what they would notice, what they would weigh against what, and where their reasoning would break.

## How it works

Frameworks live at `/frameworks/{slug}/framework.json`. Each framework defines a perceptual lens (what the decision-maker notices first), bipolar constructs (the dimensions they compare options along), a critical incident database (the documented decisions the framework was extracted from), and divergence predictions (where this framework will disagree with others on a given class of problem).

The debate API takes a user decision, fans it out across the selected frameworks, streams each framework's analysis token-by-token, and then runs a convergence pass that produces a synthesis: points of agreement, live disagreements, and the trade-off the user actually has to make.

## Available frameworks

Full frameworks (`framework.json` plus extracted `incidents/`):

- albert-einstein
- isaac-newton
- leonardo-da-vinci
- marie-curie
- niccolo-machiavelli
- nikola-tesla

Minimal frameworks (`framework.json` only, incident extraction pending):

- ada-lovelace
- alexander-the-great
- catherine-the-great
- cleopatra-vii
- sun-tzu

## Quick start

```bash
cd company-builder
npm install
npm run dev
```

You will need an `ANTHROPIC_API_KEY` in `.env.local`. See `.env.example`.

## Repo structure

```
greatminds/
  company-builder/    # Next.js app — debate UI and API routes
  frameworks/         # Extracted decision frameworks (one dir per figure)
  framework_forge/    # Python pipeline that extracts frameworks from sources
  website/            # Landing page
```

## Status

Alpha. Debate mode works. Permalinks, doc-import, and export-with-citations are not built yet.

## Non-goals

- Not a chat product.
- Not a persona clone.
- Not voice cloning.
- Not a creator-mimicry tool.

## License

MIT. See [LICENSE](../LICENSE).

## Contact / custom frameworks

Need a framework extracted for your domain or a figure relevant to your work? Contact: {CONTACT_EMAIL}
