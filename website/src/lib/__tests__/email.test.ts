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

import { sendFirstAgonRecap, sendSubscriptionConfirmation } from "../email";

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

describe("sendSubscriptionConfirmation", () => {
  it("renders the launch-deal price ($99/year) verbatim, not the rack rate", async () => {
    await sendSubscriptionConfirmation("ada@example.com", "Ada", "annual", 9900);
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("$99/year");
    expect(html).not.toContain("$300/year");
    expect(html).not.toContain("founding-member");
  });

  it("renders the rack annual price ($300/year) when that's what was paid", async () => {
    await sendSubscriptionConfirmation("ada@example.com", "Ada", "annual", 30000);
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("$300/year");
    expect(html).not.toContain("$99/year");
  });

  it("falls back to a generic annual label when priceCents is missing", async () => {
    await sendSubscriptionConfirmation("ada@example.com", "Ada", "annual");
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Agora Pro — Annual");
    expect(html).not.toContain("$300/year");
    expect(html).not.toContain("$99/year");
  });

  it("uses the flat monthly price for monthly plans", async () => {
    await sendSubscriptionConfirmation("ada@example.com", "Ada", "monthly", 3000);
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("$30/month");
  });
});
