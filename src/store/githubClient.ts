export async function githubFetch(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    signal,
  });
}
