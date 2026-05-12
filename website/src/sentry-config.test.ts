/**
 * Smoke tests for Sentry configuration files.
 *
 * These tests verify that:
 *  1. The three Sentry config files (client, server, edge) are present and
 *     contain the expected @sentry/nextjs init call.
 *  2. next.config.ts is wrapped with withSentryConfig.
 *  3. .env.example documents all required Sentry env vars.
 *
 * Actual Sentry ingestion is not tested here — that requires a real DSN and
 * is validated in production by the Sentry dashboard.
 */

import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");

describe("Sentry configuration files", () => {
  it("sentry.client.config.ts exists and initialises the SDK", () => {
    const content = fs.readFileSync(
      path.join(root, "sentry.client.config.ts"),
      "utf-8"
    );
    expect(content).toContain('@sentry/nextjs');
    expect(content).toContain('Sentry.init(');
    expect(content).toContain('NEXT_PUBLIC_SENTRY_DSN');
  });

  it("sentry.server.config.ts exists and initialises the SDK", () => {
    const content = fs.readFileSync(
      path.join(root, "sentry.server.config.ts"),
      "utf-8"
    );
    expect(content).toContain('@sentry/nextjs');
    expect(content).toContain('Sentry.init(');
    expect(content).toContain('SENTRY_DSN');
  });

  it("sentry.edge.config.ts exists and initialises the SDK", () => {
    const content = fs.readFileSync(
      path.join(root, "sentry.edge.config.ts"),
      "utf-8"
    );
    expect(content).toContain('@sentry/nextjs');
    expect(content).toContain('Sentry.init(');
    expect(content).toContain('SENTRY_DSN');
  });

  it("next.config.ts is wrapped with withSentryConfig", () => {
    const content = fs.readFileSync(
      path.join(root, "next.config.ts"),
      "utf-8"
    );
    expect(content).toContain('withSentryConfig');
    expect(content).toContain('@sentry/nextjs');
  });

  it(".env.example documents all required Sentry env vars", () => {
    const content = fs.readFileSync(
      path.join(root, ".env.example"),
      "utf-8"
    );
    expect(content).toContain('NEXT_PUBLIC_SENTRY_DSN');
    expect(content).toContain('SENTRY_DSN');
    expect(content).toContain('SENTRY_ORG');
    expect(content).toContain('SENTRY_PROJECT');
    expect(content).toContain('SENTRY_AUTH_TOKEN');
  });

  it("all three Sentry config files gate on NODE_ENV === production", () => {
    const files = [
      "sentry.client.config.ts",
      "sentry.server.config.ts",
      "sentry.edge.config.ts",
    ];
    for (const file of files) {
      const content = fs.readFileSync(path.join(root, file), "utf-8");
      expect(content, `${file} should only enable in production`).toContain(
        'NODE_ENV === "production"'
      );
    }
  });
});
