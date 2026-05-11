import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn(async () => undefined));
const ctorMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: sendMock };

    constructor(key: string) {
      ctorMock(key);
    }
  },
}));

import { sendFirstAgonRecap } from "../email";

beforeEach(() => {
  sendMock.mockClear();
  ctorMock.mockClear();
  process.env.RESEND_API_KEY = "resend_test_key";
  ctorMock.mockImplementation(() => ({
    emails: { send: sendMock },
  }));
});

describe("sendFirstAgonRecap", () => {
  it("sends a recap email to the primary address with the agon link", async () => {
    await sendFirstAgonRecap(
      {
        emailAddresses: [
          { id: "alt", emailAddress: "alt@example.com" },
          { id: "primary", emailAddress: "ada@example.com" },
        ],
        primaryEmailAddressId: "primary",
        firstName: "Ada",
      },
      {
        topic: "Should we launch the product now?",
        share_id: "share_123",
      },
    );

    expect(ctorMock).toHaveBeenCalledWith("resend_test_key");
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "notifications@consultthedead.com",
        to: "ada@example.com",
        subject: "Your first agon recap: Should we launch the product now?",
      }),
    );
    expect(sendMock.mock.calls[0][0].html).toContain("View the recap");
    expect(sendMock.mock.calls[0][0].html).toContain("https://www.consultthedead.com/agora/a/share_123");
  });

  it("throws when the user has no email address", async () => {
    await expect(
      sendFirstAgonRecap(
        {
          emailAddresses: [],
          firstName: "Ada",
        },
        {
          topic: "Should we wait?",
          share_id: null,
        },
      ),
    ).rejects.toThrow("missing recipient email");
  });
});
