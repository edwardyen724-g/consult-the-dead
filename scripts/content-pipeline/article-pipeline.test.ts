import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  buildArticleDraft,
  buildOutputPaths,
  loadTopicsFromFile,
  parseArgv,
  parseTopicsYaml,
  renderArticleDraftMarkdown,
  routePathForTopicType,
  selectTopicRecord,
  slugToTitle,
  submitSearchConsolePayload,
  runCli,
  writeDraftArtifacts,
} from "./generate-article-drafts";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const TOPICS_PATH = path.join(ROOT_DIR, "topics.yaml");

describe("topic parsing and selection", () => {
  it("parses a compact topic fixture with inline and block arrays", () => {
    const topics = parseTopicsYaml(`
# comment
- slug: test-topic
  type: insight
  search_volume_estimate: high
  primary_query: 'What would X say? #1'
  secondary_queries:
  recommended_council: ['marcus-aurelius', 'niccolo-machiavelli']
  hook_angles:
    - tension
    - proof
  status: 'queued' # keep this queued
  shipped_at: null
`);

    expect(topics).toEqual([
      {
        slug: "test-topic",
        type: "insight",
        searchVolumeEstimate: "high",
        primaryQuery: "What would X say? #1",
        secondaryQueries: [],
        recommendedCouncil: ["marcus-aurelius", "niccolo-machiavelli"],
        hookAngles: ["tension", "proof"],
        status: "queued",
        shippedAt: null,
      },
    ]);
  });

  it("rejects malformed topic records that are missing required fields", () => {
    expect(() =>
      parseTopicsYaml(`
- slug: incomplete-topic
  type: decision
  search_volume_estimate: high
`),
    ).toThrow("Invalid topic record");
  });

  it("loads the real topics queue and resolves a slug or the next queued record", async () => {
    const topics = await loadTopicsFromFile(TOPICS_PATH);
    const explicit = selectTopicRecord(topics, { slug: "should-i-raise-vc-or-bootstrap" });
    const queued = selectTopicRecord(topics);
    const direct = selectTopicRecord(topics, { record: explicit });

    expect(explicit.primaryQuery).toBe("should I raise VC or bootstrap");
    expect(explicit.status).toBe("shipped");
    expect(queued.status).toBe("queued");
    expect(queued.slug.length).toBeGreaterThan(0);
    expect(direct).toBe(explicit);
    expect(() => selectTopicRecord(topics, { slug: "definitely-not-a-real-slug" })).toThrow(
      "Unknown topic slug: definitely-not-a-real-slug",
    );
    expect(() => selectTopicRecord([], {} as never)).toThrow("No queued topic records available");
  });

  it("keeps the pruned low-signal topics out of the active queue", async () => {
    const topics = await loadTopicsFromFile(TOPICS_PATH);
    const slugs = topics.map((topic) => topic.slug);

    expect(slugs).not.toContain("should-i-hire-or-outsource");
    expect(slugs).not.toContain("what-would-machiavelli-say-about-startup-cap-tables");
  });

  it("derives stable titles and route paths", () => {
    expect(slugToTitle("should-i-raise-vc-or-bootstrap")).toBe("Should I Raise VC or Bootstrap");
    expect(slugToTitle("critical-decision-method-explained")).toBe("Critical Decision Method Explained");
    expect(routePathForTopicType("decision")).toBe("decisions");
    expect(routePathForTopicType("insight")).toBe("insights");
    expect(routePathForTopicType("method")).toBe("methods");
  });
});

describe("draft generation", () => {
  it("builds a markdown draft and Search Console payload for a decision topic", async () => {
    const topics = await loadTopicsFromFile(TOPICS_PATH);
    const topic = selectTopicRecord(topics, { slug: "should-i-raise-vc-or-bootstrap" });
    const draft = await buildArticleDraft(topic, {
      generatedAt: "2026-05-09T12:00:00.000Z",
      siteBaseUrl: "https://consultthedead.com",
    });
    const markdown = renderArticleDraftMarkdown(draft);

    expect(draft.title).toBe("Should I Raise VC or Bootstrap");
    expect(draft.articleUrl).toBe("https://consultthedead.com/decisions/should-i-raise-vc-or-bootstrap");
    expect(draft.internalCta).toContain("/agora?utm_source=content_engine");
    expect(draft.frameworkCitations.map((citation) => citation.person)).toEqual([
      "Niccolo Machiavelli",
      "Marie Curie",
      "Sun Tzu",
    ]);
    expect(draft.frameworkCitations[0]?.incident.id).toBeTruthy();
    expect(draft.searchConsolePayload).toEqual({
      url: "https://consultthedead.com/decisions/should-i-raise-vc-or-bootstrap",
      type: "URL_UPDATED",
    });
    expect(markdown).toContain("# Should I Raise VC or Bootstrap");
    expect(markdown).toContain("## Intro");
    expect(markdown).toContain("## Internal link CTA");
    expect(markdown).toContain("## Framework citations");
    expect(markdown).toContain("Marie Curie");
    expect(markdown).toContain("Sun Tzu");
    expect(markdown).toContain('"type": "URL_UPDATED"');
  });

  it("supports method topics with the fallback council and artifact paths", async () => {
    const topics = await loadTopicsFromFile(TOPICS_PATH);
    const topic = selectTopicRecord(topics, { slug: "critical-decision-method-explained" });
    const draft = await buildArticleDraft(topic, {
      generatedAt: "2026-05-09T12:00:00.000Z",
      siteBaseUrl: "https://consultthedead.com",
    });
    const outputs = buildOutputPaths(draft, path.join(os.tmpdir(), "content-pipeline-test"));

    expect(draft.frameworkCitations.map((citation) => citation.person)).toEqual([
      "Marcus Aurelius",
      "Niccolo Machiavelli",
      "Sun Tzu",
    ]);
    expect(outputs.markdownPath).toContain(path.join("drafts", "methods"));
    expect(outputs.searchConsolePath).toContain(path.join("search-console", "critical-decision-method-explained.json"));
  });

  it("builds an insight draft with the insight route and runCli writes artifacts", async () => {
    const topics = await loadTopicsFromFile(TOPICS_PATH);
    const insightTopic = selectTopicRecord(topics, { slug: "what-would-marcus-aurelius-say-about-burnout" });
    const insightDraft = await buildArticleDraft(insightTopic, {
      generatedAt: "2026-05-09T12:00:00.000Z",
      siteBaseUrl: "https://consultthedead.com",
    });

    expect(insightDraft.routePath).toBe("insights");
    expect(insightDraft.intro).toContain("quote-card summary");
    expect(insightDraft.searchConsolePayload.url).toBe(
      "https://consultthedead.com/insights/what-would-marcus-aurelius-say-about-burnout",
    );

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ctd-content-pipeline-"));
    const submitSearchConsolePayloadMock = vi.fn(async () => ({
      endpoint: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      response: {
        ok: true,
      },
    }));

    await runCli([
      "--slug",
      "should-i-quit-my-job-to-start-a-company",
      "--output-dir",
      tempDir,
      "--site-base-url",
      "https://consultthedead.com",
      "--no-dry-run",
    ], {
      submitSearchConsolePayload: submitSearchConsolePayloadMock,
    });
    await runCli([
      "--slug",
      "should-i-raise-vc-or-bootstrap",
      "--output-dir",
      tempDir,
      "--site-base-url",
      "https://consultthedead.com",
      "--dry-run",
    ], {
      submitSearchConsolePayload: submitSearchConsolePayloadMock,
    });
    expect(submitSearchConsolePayloadMock).toHaveBeenCalledWith({
      url: "https://consultthedead.com/decisions/should-i-quit-my-job-to-start-a-company",
      type: "URL_UPDATED",
    });
    submitSearchConsolePayloadMock.mockClear();
    const outputs = buildOutputPaths(
      {
        slug: "should-i-quit-my-job-to-start-a-company",
        type: "decision",
      },
      tempDir,
    );
    const markdown = await fs.readFile(outputs.markdownPath, "utf8");
    const payload = await fs.readFile(outputs.searchConsolePath, "utf8");

    expect(markdown).toContain("Should I Quit My Job to Start a Company");
    expect(markdown).toContain("Run your own version in the Agora");
    expect(payload).toContain("/decisions/should-i-quit-my-job-to-start-a-company");
    expect(submitSearchConsolePayloadMock).not.toHaveBeenCalled();
  });

  it("submits the Search Console payload with an access token from the environment", async () => {
    const originalToken = process.env.SEARCH_CONSOLE_ACCESS_TOKEN;
    const fetchImpl = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          urlNotificationMetadata: {
            latestUpdate: {
              notifyTime: "2026-05-09T12:00:00.000Z",
            },
          },
        }),
        text: async () => "",
      } as never;
    });

    process.env.SEARCH_CONSOLE_ACCESS_TOKEN = "env-token";

    try {
      const result = await submitSearchConsolePayload(
        {
          url: "https://consultthedead.com/decisions/should-i-raise-vc-or-bootstrap",
          type: "URL_UPDATED",
        },
        {
          fetchImpl: fetchImpl as never,
        },
      );

      expect(fetchImpl).toHaveBeenCalledWith(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer env-token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            url: "https://consultthedead.com/decisions/should-i-raise-vc-or-bootstrap",
            type: "URL_UPDATED",
          }),
        }),
      );
      expect(result).toEqual({
        endpoint: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        response: {
          urlNotificationMetadata: {
            latestUpdate: {
              notifyTime: "2026-05-09T12:00:00.000Z",
            },
          },
        },
      });
    } finally {
      process.env.SEARCH_CONSOLE_ACCESS_TOKEN = originalToken;
    }
  });

  it("does not write draft artifacts in dry-run mode", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ctd-content-pipeline-dry-run-"));
    const draftOutputs = buildOutputPaths(
      {
        slug: "should-i-raise-vc-or-bootstrap",
        type: "decision",
      },
      tempDir,
    );

    await runCli([
      "--slug",
      "should-i-raise-vc-or-bootstrap",
      "--output-dir",
      tempDir,
      "--site-base-url",
      "https://consultthedead.com",
      "--dry-run",
    ]);

    await expect(fs.access(draftOutputs.markdownPath)).rejects.toThrow();
    await expect(fs.access(draftOutputs.searchConsolePath)).rejects.toThrow();
  });

  it("submits the payload in non-dry-run mode and skips submission for dry-run", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ctd-content-pipeline-submit-"));
    const submitSearchConsolePayloadMock = vi.fn(async () => ({
      endpoint: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      response: {
        ok: true,
      },
    }));

    await runCli(
      [
        "--slug",
        "should-i-quit-my-job-to-start-a-company",
        "--output-dir",
        tempDir,
        "--site-base-url",
        "https://consultthedead.com",
        "--no-dry-run",
      ],
      {
        submitSearchConsolePayload: submitSearchConsolePayloadMock,
      },
    );

    expect(submitSearchConsolePayloadMock).toHaveBeenCalledWith({
      url: "https://consultthedead.com/decisions/should-i-quit-my-job-to-start-a-company",
      type: "URL_UPDATED",
    });

    submitSearchConsolePayloadMock.mockClear();

    await runCli(
      [
        "--slug",
        "should-i-raise-vc-or-bootstrap",
        "--output-dir",
        tempDir,
        "--site-base-url",
        "https://consultthedead.com",
        "--dry-run",
      ],
      {
        submitSearchConsolePayload: submitSearchConsolePayloadMock,
      },
    );

    expect(submitSearchConsolePayloadMock).not.toHaveBeenCalled();
  });

  it("throws when a framework JSON is missing its incident database", async () => {
    const fakeTopic = {
      slug: "fake-draft",
      type: "decision" as const,
      searchVolumeEstimate: "high" as const,
      primaryQuery: "fake question",
      secondaryQueries: [],
      recommendedCouncil: ["fake-framework"],
      hookAngles: [],
      status: "queued" as const,
      shippedAt: null,
    };
    const readFileSpy = vi.spyOn(fs, "readFile").mockImplementation(async () => {
      return JSON.stringify({
        meta: { person: "Fake Framework" },
        bipolar_constructs: [
          {
            construct: "Stub construct",
            behavioral_implication: "Stub implication",
          },
        ],
      }) as never;
    });

    try {
      await expect(
        buildArticleDraft(fakeTopic, {
          generatedAt: "2026-05-09T12:00:00.000Z",
          siteBaseUrl: "https://consultthedead.com",
        }),
      ).rejects.toThrow("missing an incident summary");
    } finally {
      readFileSpy.mockRestore();
    }
  });
});

describe("argument parsing", () => {
  it("defaults to dry-run and accepts explicit overrides", () => {
    expect(parseArgv(["--slug", "should-i-quit-my-job-to-start-a-company"]).dryRun).toBe(true);
    expect(
      parseArgv([
        "--slug",
        "should-i-quit-my-job-to-start-a-company",
        "--no-dry-run",
        "--output-dir",
        "/tmp/drafts",
        "--topics",
        "/tmp/topics.yaml",
        "--site-base-url",
        "https://example.com",
      ]),
    ).toEqual({
      slug: "should-i-quit-my-job-to-start-a-company",
      topicsPath: "/tmp/topics.yaml",
      outputDir: "/tmp/drafts",
      dryRun: false,
      siteBaseUrl: "https://example.com",
    });
  });
});
