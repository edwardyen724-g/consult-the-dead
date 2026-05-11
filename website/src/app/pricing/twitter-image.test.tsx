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

describe("pricing twitter-image", () => {
  it("re-exports the OG image route and keeps the metadata aligned", () => {
    expect(TwitterImage).toBe(OGImage);
    expect(runtime).toBe("nodejs");
    expect(revalidate).toBe(3600);
    expect(dynamicParams).toBe(false);
    expect(alt).toBe("Pricing share card from Consult The Dead");
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
