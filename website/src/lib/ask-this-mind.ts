export const ASK_THIS_MIND_TOPIC_LIMIT = 3;
export const ASK_THIS_MIND_MIN_TOPIC_LENGTH = 10;
export const ASK_THIS_MIND_MAX_TOPIC_LENGTH = 2000;

export type AskThisMindStatus = "idle" | "submitting" | "streaming" | "done" | "error";

export type StateSetter<T> = (value: T | ((current: T) => T)) => void;

export interface AskThisMindLimitState {
  remaining: number;
  canSubmit: boolean;
  message: string;
}

export interface AskThisMindStreamResult {
  analysis: string;
  remaining?: number;
}

export interface AskThisMindStreamOptions {
  frameworkSlug: string;
  topic: string;
  fetchImpl?: typeof fetch;
  apiKey?: string | null;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
}

export interface AskThisMindSubmitOptions {
  frameworkSlug: string;
  topic: string;
  submittedTopics: string[];
  fetchImpl?: typeof fetch;
  apiKey?: string | null;
  signal?: AbortSignal;
  setTopic: StateSetter<string>;
  setAnalysis: StateSetter<string>;
  setSubmittedTopics: StateSetter<string[]>;
  setStatus: StateSetter<AskThisMindStatus>;
  setError: StateSetter<string | null>;
}

type AskThisMindEvent =
  | { type: "analysis_started"; frameworkSlug: string; frameworkName?: string }
  | { type: "analysis_chunk"; frameworkSlug: string; text: string }
  | { type: "analysis_done"; frameworkSlug: string; frameworkName?: string; analysis: string; remaining?: number }
  | { type: string; [key: string]: unknown };

export class AskThisMindRequestError extends Error {
  status: number;
  rateLimited: boolean;

  constructor(message: string, status: number, rateLimited = false) {
    super(message);
    this.name = "AskThisMindRequestError";
    this.status = status;
    this.rateLimited = rateLimited;
  }
}

export function getAskThisMindLimitState(submittedTopics: string[]): AskThisMindLimitState {
  const remaining = Math.max(0, ASK_THIS_MIND_TOPIC_LIMIT - submittedTopics.length);
  const canSubmit = remaining > 0;

  return {
    remaining,
    canSubmit,
    message: canSubmit
      ? `${remaining} of ${ASK_THIS_MIND_TOPIC_LIMIT} topics remain on this page.`
      : `You have used all ${ASK_THIS_MIND_TOPIC_LIMIT} topics on this page.`,
  };
}

export function normalizeAskThisMindError(error: unknown): string {
  if (error instanceof AskThisMindRequestError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message || "Ask This Mind failed. Try again.";
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  return "Ask This Mind failed. Try again.";
}

function parseEventBlock(block: string): AskThisMindEvent | null {
  const dataLine = block
    .split(/\r?\n/)
    .find((line) => line.startsWith("data: "));

  if (!dataLine) {
    return null;
  }

  try {
    return JSON.parse(dataLine.slice(6)) as AskThisMindEvent;
  } catch {
    return null;
  }
}

async function readAnalysisStream(
  response: Response,
  onChunk?: (chunk: string) => void
): Promise<AskThisMindStreamResult> {
  if (!response.body) {
    throw new AskThisMindRequestError("Analysis response did not include a stream.", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let analysis = "";
  let remaining: number | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex).trim();
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf("\n\n");

      if (!block) {
        continue;
      }

      const event = parseEventBlock(block);
      if (!event) {
        continue;
      }

      if (event.type === "analysis_chunk" && typeof event.text === "string") {
        analysis += event.text;
        onChunk?.(event.text);
      } else if (event.type === "analysis_done") {
        if (typeof event.analysis === "string") {
          analysis = event.analysis;
        }
        if (typeof event.remaining === "number") {
          remaining = event.remaining;
        }
        return { analysis, remaining };
      }
    }
  }

  return { analysis, remaining };
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) {
    return `Ask This Mind request failed with status ${response.status}.`;
  }

  try {
    const payload = JSON.parse(text) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }
  } catch {
    // Fall through to text/status fallback.
  }

  return text.trim() || `Ask This Mind request failed with status ${response.status}.`;
}

export async function streamAskThisMindAnalysis({
  frameworkSlug,
  topic,
  fetchImpl = fetch,
  apiKey = null,
  signal,
  onChunk,
}: AskThisMindStreamOptions): Promise<AskThisMindStreamResult> {
  const response = await fetchImpl("/api/generate-analysis", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({ frameworkSlug, topic }),
    signal,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new AskThisMindRequestError(
      message,
      response.status,
      response.status === 429
    );
  }

  return readAnalysisStream(response, onChunk);
}

export function createAskThisMindSubmitHandler({
  frameworkSlug,
  topic,
  submittedTopics,
  fetchImpl,
  apiKey,
  signal,
  setTopic,
  setAnalysis,
  setSubmittedTopics,
  setStatus,
  setError,
}: AskThisMindSubmitOptions) {
  return async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setStatus("error");
      setError("Add a topic before asking this mind.");
      return;
    }

    if (trimmedTopic.length < ASK_THIS_MIND_MIN_TOPIC_LENGTH) {
      setStatus("error");
      setError(`Topic must be at least ${ASK_THIS_MIND_MIN_TOPIC_LENGTH} characters.`);
      return;
    }

    if (trimmedTopic.length > ASK_THIS_MIND_MAX_TOPIC_LENGTH) {
      setStatus("error");
      setError(`Topic must be ${ASK_THIS_MIND_MAX_TOPIC_LENGTH} characters or fewer.`);
      return;
    }

    const limitState = getAskThisMindLimitState(submittedTopics);
    if (!limitState.canSubmit) {
      setStatus("error");
      setError(limitState.message);
      return;
    }

    setStatus("submitting");
    setError(null);
    setAnalysis("");

    try {
      const result = await streamAskThisMindAnalysis({
        frameworkSlug,
        topic: trimmedTopic,
        fetchImpl,
        apiKey,
        signal,
        onChunk: (chunk) => {
          setStatus("streaming");
          setAnalysis((current) => current + chunk);
        },
      });

      setAnalysis(result.analysis);
      setSubmittedTopics((current) => [...current, trimmedTopic]);
      setTopic("");
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setError(normalizeAskThisMindError(error));
    }
  };
}
