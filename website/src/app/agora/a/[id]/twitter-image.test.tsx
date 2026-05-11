import { describe, expect, it } from "vitest";

import OGImage, {
  alt as ogAlt,
  contentType as ogContentType,
  dynamicParams as ogDynamicParams,
  revalidate as ogRevalidate,
  runtime as ogRuntime,
  size as ogSize,
} from "./opengraph-image";
import TwitterImage, {
  alt,
  contentType,
  dynamicParams,
  revalidate,
  runtime,
  size,
} from "./twitter-image";

describe("Agora twitter-image", () => {
  it("re-exports the OG image handler and static config", () => {
    expect(TwitterImage).toBe(OGImage);
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(alt).toBe("An agon from Consult The Dead — The Agora");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");

    expect(runtime).toBe(ogRuntime);
    expect(revalidate).toBe(ogRevalidate);
    expect(dynamicParams).toBe(ogDynamicParams);
    expect(alt).toBe(ogAlt);
    expect(size).toEqual(ogSize);
    expect(contentType).toBe(ogContentType);
  });
});
