# Consulting the Dead, Not Distilling the Living

## What just happened

On March 30, 2026, a developer publishing under the handle titanwings shipped [colleague.skill (同事.skill)](https://github.com/titanwings/colleague-skill) to GitHub. Within days the repository crossed roughly seventy thousand stars. The premise is direct: take everything a departed employee left behind in Feishu, DingTalk, internal wikis, code comments, and email, and compress it into a single Skill that another model can load on demand. The format is OpenClaw's `SKILL.md`, the same convention Claude Code uses to register tools and capabilities. The slogan, in the project's own words, is "将冰冷的离别化为温暖的 Skill" — "Transform cold farewells into warm Skills."

The pattern did not stop at offboarding. Within a week, public figures were being treated as feedstock. Distillations of the writer Dan Koe began circulating. Chinese tech press caught up quickly: [PANews](https://www.panewslab.com/en/articles/019d5ce0-cf61-77cd-86b0-bee38c8c69da) ran a technical critique, [Sina Finance](https://finance.sina.com.cn/wm/2026-04-05/doc-inhtmnnv8491995.shtml) covered the labor and privacy backlash, and Sohu and Tencent News followed. A counter-project called anti-distill appeared on GitHub almost immediately, offering tooling for employees who do not wish to be reduced to a corpus.

## What they're actually capturing

The honest critique, articulated most clearly by PANews, is narrower than the marketing. A pipeline of voice cloning, retrieval over a private corpus, and a system prompt can capture what someone wrote down. It can imitate cadence. It can recall the artifacts of past work and the surface texture of past arguments. That is a real capability, and pretending otherwise is silly.

It is also where the capability stops. The corpus contains decisions but not the reasoning that produced them. It contains the polished memo but not the three drafts that were thrown away, the conversation in the hallway, the half-formed worry that made the author rewrite the second paragraph at midnight. Tacit knowledge — the part of expertise that practitioners cannot fully articulate even when asked directly — leaves no Feishu trace. Neither does the felt sense of which problems are worth taking seriously and which only look urgent.

What you get, then, is a stylistic puppet. It produces text that resembles the source on the dimensions the source happened to write down, and silently fabricates on the dimensions they did not. The puppet is convincing precisely in proportion to how much the user already knew the original. To anyone else it is a confident stranger wearing a borrowed voice. This is not a complaint about model quality. No amount of additional training closes a gap that begins with the data not existing.

## The opposite operation

greatmind is the inverse operation, and the contrast is worth being precise about.

colleague.skill distills *style* from the *living*. greatmind extracts *decision structure* from the *dead*. colleague.skill scrapes private archives that the subject never consented to publish. greatmind works from documented historical incidents in the public domain — letters, dispatches, lab notebooks, court records, the long tail of material that historians have already argued over for a century. colleague.skill produces a chatbot that sounds like a person. greatmind produces a framework that reasons the way a person reasoned when they faced a decision structurally similar to yours.

The extraction method is borrowed from cognitive task analysis rather than from voice cloning. Each framework is built by running the Critical Decision Method (CDM) over a curated incident database for one historical figure. CDM is the same instrument that has been used for forty years to interview firefighters, pilots, and surgeons about how they make calls under pressure. Applied to the documentary record, it yields four things: a perceptual lens (what the person noticed first and what they ignored), a small set of bipolar constructs (the axes their judgment actually moved along), a database of critical incidents with explicit decision points, and a set of divergence predictions — places where this framework will recommend something different from a generic optimizer. Each framework also carries its own blind spots, declared up front. Every framework is then validated by replaying it against documented incidents the subject actually faced, and checking whether the framework's recommendation matches what the subject actually did.

The metaphor that keeps coming back to me is the difference between portraiture and anatomy. colleague.skill is a portrait: it captures the outward appearance, and a good portrait can be moving. greatmind is an anatomical dissection: less flattering, more useful when you need to know how the system actually moves. A portrait of Machiavelli is not Machiavelli. Neither is a dissection. But if your problem is "how would this mind decompose the situation in front of me," only one of the two is the right instrument.

## Why debate is the product

The company-builder app ships with one mode and only one mode: multi-framework debate. You write down a real decision, you pick three frameworks, and you watch them argue. There is no single-persona chat. There is no "ask Tesla a question" mode. This is a deliberate constraint, not a missing feature.

The reason is that any single-persona surface immediately collapses into the category the market already understands — clones, personas, [Delphi-style avatars](https://venturebeat.com/ai/you-can-now-make-an-ai-clone-of-yourself-or-anyone-else-living-or-dead-with-delphi). Multiple minds in dialogue over one concrete decision is a shape that cannot be confused with that category, because no clone product produces useful disagreement; clones are built to please. Frameworks are built to differ.

There is also a historical precedent that matters here. In his December 1513 letter to Francesco Vettori, Machiavelli described his evening practice: he would change out of his muddy day clothes, put on court robes, and enter his study to "consult the ancients," asking them about their reasons and recording their answers. The product is that ritual, run at software speed, with the ancients answering each other instead of only the asker.

## What we're shipping

greatmind is open source at {GITHUB_LINK}. The positioning fits on one line: multi-framework decision support, extracted from documented historical incidents. Not a persona. Not a clone. Custom framework extraction for figures or domains not yet covered is available on request through [/contact](/contact).

If you take one thing from this essay, take this. The next real decision you face this week — the one you have been putting off because the tradeoffs are ugly — run it through three frameworks before you run it through your own head one more time. You will not get an answer. You will get three structured disagreements, and the disagreement is the part that was missing.
