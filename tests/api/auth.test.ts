import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockRegisterUser = vi.fn();
const mockLoginUser = vi.fn();
const mockLogoutUser = vi.fn();
const mockGetSessionUser = vi.fn();
const mockGetSessionCookieConfig = vi.fn();
const mockCreatePasswordResetToken = vi.fn();
const mockResetPasswordWithToken = vi.fn();
const mockCheck = vi.fn();

vi.mock("@/lib/auth", () => ({
  registerUser: mockRegisterUser,
  loginUser: mockLoginUser,
  logoutUser: mockLogoutUser,
  getSessionUser: mockGetSessionUser,
  getSessionCookieConfig: mockGetSessionCookieConfig,
  createPasswordResetToken: mockCreatePasswordResetToken,
  resetPasswordWithToken: mockResetPasswordWithToken,
}));

vi.mock("@/lib/rateLimit", () => ({
  createRateLimiter: () => ({ check: mockCheck }),
}));

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(() => null),
}));

function mockRequest(body?: any, url = "http://localhost") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheck.mockResolvedValue({ success: true });
  mockGetSessionCookieConfig.mockReturnValue({
    name: "vil_session",
    value: "tok",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 604800,
    path: "/",
  });
});

describe("POST /api/auth/register", () => {
  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const req = mockRequest({ email: "bad" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockResolvedValueOnce({ success: false });
    const { POST } = await import("@/app/api/auth/register/route");
    const req = mockRequest({ email: "a@a.com", username: "user", name: "N", lastName: "L", password: "pass1234" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 201 on successful registration", async () => {
    mockRegisterUser.mockResolvedValueOnce({ success: true, userId: 1 });
    const { POST } = await import("@/app/api/auth/register/route");
    const req = mockRequest({ email: "a@a.com", username: "user", name: "N", lastName: "L", password: "pass1234" });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 409 on duplicate email", async () => {
    mockRegisterUser.mockResolvedValueOnce({ success: false, error: "Email already registered" });
    const { POST } = await import("@/app/api/auth/register/route");
    const req = mockRequest({ email: "a@a.com", username: "user", name: "N", lastName: "L", password: "pass1234" });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("handles JSON parse error", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const req = new NextRequest("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const req = mockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockResolvedValueOnce({ success: false });
    const { POST } = await import("@/app/api/auth/login/route");
    const req = mockRequest({ email: "a@a.com", password: "pass" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 401 on invalid credentials", async () => {
    mockLoginUser.mockResolvedValueOnce({ success: false, error: "Invalid credentials" });
    const { POST } = await import("@/app/api/auth/login/route");
    const req = mockRequest({ email: "a@a.com", password: "wrong" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 on successful login", async () => {
    mockLoginUser.mockResolvedValueOnce({ success: true, userId: 1, token: "tok" });
    const { POST } = await import("@/app/api/auth/login/route");
    const req = mockRequest({ email: "a@a.com", password: "pass" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200", async () => {
    const { POST } = await import("@/app/api/auth/logout/route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(mockLogoutUser).toHaveBeenCalled();
  });
});

describe("GET /api/auth/session", () => {
  it("returns unauthenticated when no session", async () => {
    mockGetSessionUser.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/auth/session/route");
    const res = await GET();
    const data = await res.json();
    expect(data.authenticated).toBe(false);
  });

  it("returns user when authenticated", async () => {
    mockGetSessionUser.mockResolvedValueOnce({ id: 1, email: "u@u.com" });
    const { GET } = await import("@/app/api/auth/session/route");
    const res = await GET();
    const data = await res.json();
    expect(data.authenticated).toBe(true);
    expect(data.user.id).toBe(1);
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("returns 400 for invalid email", async () => {
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const req = mockRequest({ email: "bad" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockResolvedValueOnce({ success: false });
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const req = mockRequest({ email: "a@a.com" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 404 when email not found", async () => {
    mockCreatePasswordResetToken.mockResolvedValueOnce({ success: false, error: "No account found" });
    const { POST } = await import("@/app/api/auth/forgot-password/route");
    const req = mockRequest({ email: "noone@t.com" });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/reset-password", () => {
  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const req = mockRequest({ token: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when reset fails", async () => {
    mockResetPasswordWithToken.mockResolvedValueOnce({ success: false, error: "Invalid token" });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const req = mockRequest({ token: "bad", password: "newpass123" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful reset", async () => {
    mockResetPasswordWithToken.mockResolvedValueOnce({ success: true });
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const req = mockRequest({ token: "valid", password: "newpass123" });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
