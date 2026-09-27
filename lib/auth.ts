export function isValidAdminSession(cookieValue: string | undefined): boolean {
  return cookieValue === "authenticated";
}