import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { githubFetch } from "@/store/githubClient";

describe("githubFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the Response on success", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) } as Response;
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await githubFetch("/user", "tok123");
    expect(result).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/user", {
      headers: {
        Authorization: "Bearer tok123",
        Accept: "application/vnd.github+json",
      },
      signal: undefined,
    });
  });

  it("returns the Response on non-200 without throwing", async () => {
    const mockResponse = { ok: false, status: 404, statusText: "Not Found" } as Response;
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const result = await githubFetch("/user", "tok123");
    expect(result).toBe(mockResponse);
    expect(result.ok).toBe(false);
  });

  it("forwards AbortSignal to fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const controller = new AbortController();
    await githubFetch("/user", "tok123", controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
