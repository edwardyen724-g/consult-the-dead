/**
 * Unit tests for GET /api/health
 *
 * Requires vitest (PR #5: wanman/vitest-unit-test-framework).
 * Run with: npm test (inside website/)
 */

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns 200 with status=ok shape", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.commit).toBe("string");
    expect(body.commit.length).toBeGreaterThan(0);
  });

  it("returns env field", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toHaveProperty("env");
  });
});
