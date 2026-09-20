const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      name: string;
      username: string;
    };
  };
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  const result: LoginResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Login failed"
    );
  }

  if (result.data) {
    localStorage.setItem(
      "token",
      result.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(result.data.user)
    );
  }

  return result;
}

export async function logoutUser(): Promise<LogoutResponse> {
  const token =
    localStorage.getItem("token");

  try {
    if (token) {
      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: LogoutResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Logout failed"
        );
      }

      return result;
    }

    return {
      success: true,
      message: "Already logged out",
    };
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}