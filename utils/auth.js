function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function forceLogout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminId");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}
