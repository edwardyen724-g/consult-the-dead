import {
  buildEmail,
  cliMain,
  formatDryRunSummary,
  sendOutreach,
  type OutreachRecipient,
  type ResendSender,
  OutreachError,
} from "../send-outreach";

type TestFn = () => void | Promise<void>;
type DescribeFn = (name: string, body: () => void) => void;
type ItFn = (name: string, fn: TestFn) => void;
type ExpectFn = (actual: unknown) => {
  toBe(expected: unknown): void;
  toContain(needle: string): void;
  toMatch(pattern: RegExp): void;
  toBeTruthy(): void;
};

const fixture: OutreachRecipient = {
  slug: "abhishek-chakravarty",
  name: "Abhishek Chakravarty",
  email: "",
  agon_url: "https://consultthedead.com/agora/a/abhishek-chakravarty?utm_source=outreach&utm_medium=email&utm_campaign=founder-may26&utm_content=abhishek-chakravarty",
  topic_line: "whether to keep competing on price at Youform or reposition as premium at $18K MRR",
  subject_line: "3 dead strategists argued your Youform pricing question",
};

export function registerSendOutreachCoverageEdgeCases(
  describe: DescribeFn,
  it: ItFn,
  expect: ExpectFn,
): void {
  describe("sendOutreach coverage edge cases", () => {
    it("trims explicit --to overrides before sending", async () => {
      let observedTo: string | null = null;
      const sender: ResendSender = async (input) => {
        observedTo = input.to;
        return { data: { id: "msg_trimmed" } };
      };

      const result = await sendOutreach({
        slug: fixture.slug,
        to: "  founder@example.com  ",
        dryRun: false,
        env: { RESEND_API_KEY: "re_test" },
        resendSender: sender,
      });

      expect(result.status).toBe("sent");
      expect(observedTo).toBe("founder@example.com");
      expect(result.to).toBe("founder@example.com");
    });

    it("uses the dry-run placeholder when a roster email is still empty", async () => {
      const result = await sendOutreach({
        slug: fixture.slug,
        dryRun: true,
        env: {},
      });

      expect(result.status).toBe("dry-run");
      expect(result.to).toBe(
        "(no email yet — pass --to or fill in outreach-list.ts before sending)",
      );
      expect(formatDryRunSummary(result)).toContain("(no email yet");
    });

    it("keeps the fallback subject stable when the topic is one long word", () => {
      const result = buildEmail({
        ...fixture,
        subject_line: "",
        topic_line:
          "supercalifragilisticexpialidocioussupercalifragilisticexpialidocious",
      });

      expect(result.subject).toMatch(/^3 dead strategists argued/);
      expect(result.subject.endsWith("…")).toBe(true);
    });

    it("prefers the missing-email guard over the env guard when both are absent", async () => {
      let caught: unknown = null;
      try {
        await sendOutreach({
          slug: fixture.slug,
          dryRun: false,
          env: {},
        });
      } catch (error) {
        caught = error;
      }

      expect(caught instanceof OutreachError).toBe(true);
      expect((caught as Error).message).toContain("No email for slug");
      expect((caught as Error).message).toMatch(/--to <email>/);
    });

    it("falls back to '(no message)' when the CLI receives an empty resend error", async () => {
      const out: string[] = [];
      const err: string[] = [];
      let exitCode: number | null = null;

      await cliMain({
        argv: ["--slug", fixture.slug, "--to", "founder@example.com"],
        stdout: (line) => out.push(line),
        stderr: (line) => err.push(line),
        setExitCode: (code) => {
          exitCode = code;
        },
        send: async () => ({
          status: "error",
          recipient: fixture,
          to: "founder@example.com",
          subject: "stub",
          errorMessage: undefined as unknown as string,
        }),
      });

      expect(out.length).toBe(0);
      expect(err.join("\n")).toContain("(no message)");
      expect(exitCode).toBe(1);
    });
  });
}
