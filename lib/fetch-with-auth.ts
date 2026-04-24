import { getGuestId } from "./guest-id";

export function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const guestId = getGuestId();
  if (guestId) {
    headers.set("x-guest-id", guestId);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}
