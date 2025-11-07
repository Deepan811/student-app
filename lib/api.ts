// API utility functions for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  
}

interface ForgotPasswordData {
  email: string
  userType: "student" | "admin"
}

interface ForceChangePasswordData {
  temporaryPassword: string;
  newPassword: string;
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      let errorData: ApiResponse = { success: false, message: "An unknown error occurred." };
      try {
        // Try to parse JSON even for non-OK responses, as server might send error details
        errorData = await response.json();
      } catch (jsonError) {
        // If parsing fails, it means the response body was not JSON or was empty
        errorData.message = `Server error: ${response.status} ${response.statusText || ''}. No JSON response.`;
      }
      // Throw an error to be caught by the outer catch block
      throw new Error(errorData.message);
    }

    const data = await response.json()
    return data
  } catch (error: any) { // Explicitly type error as 'any' for easier handling
    console.error("API call failed:", error);
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    }
  }
}

// Authentication API functions
export const authApi = {
  // Student registration
  register: async (userData: RegisterData): Promise<ApiResponse> => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  // Student login
  login: async (loginData: LoginData): Promise<ApiResponse> => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    })
  },

  // Admin login
  adminLogin: async (loginData: LoginData): Promise<ApiResponse> => {
    return apiCall("/admin/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    })
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Get user profile
  getProfile: async (token: string): Promise<ApiResponse> => {
    return apiCall("/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Force password change
  forceChangePassword: async (data: ForceChangePasswordData, token: string): Promise<ApiResponse> => {
    return apiCall("/auth/force-password-change", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
}

// Courses API functions
export const coursesApi = {
  // Get all courses
  getCourses: async (): Promise<ApiResponse> => {
    return apiCall("/courses")
  },

  // Enroll in course
  enrollCourse: async (courseId: string, token: string): Promise<ApiResponse> => {
    return apiCall(`/courses/${courseId}/enroll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Get enrolled courses
  getEnrolledCourses: async (token: string): Promise<ApiResponse> => {
    return apiCall("/students/enrolled-courses", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

// Admin API functions
export const adminApi = {
  // Get pending users
  getPendingUsers: async (token: string): Promise<ApiResponse> => {
    return apiCall("/admin/users/pending", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Update user status
  updateUserStatus: async (
    userId: string,
    status: "approved" | "rejected",
    token: string,
    reason?: string,
  ): Promise<ApiResponse> => {
    return apiCall(`/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, reason }),
    })
  },

  // Get all users
  getAllUsers: async (token: string, page = 1, limit = 10): Promise<ApiResponse> => {
    return apiCall(`/admin/users?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) => apiCall<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options: RequestInit = {}) => apiCall<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options: RequestInit = {}) => apiCall<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options: RequestInit = {}) => apiCall<T>(endpoint, { ...options, method: 'DELETE' }),
};
