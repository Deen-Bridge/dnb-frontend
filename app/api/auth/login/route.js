import axiosInstance from "@/lib/config/axios.config";

// Simple in-memory rate limiter (use Redis in production)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier) {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || [];

  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remainingTime: WINDOW_MS - (now - recentAttempts[0]),
    };
  }

  // Add current attempt
  recentAttempts.push(now);
  loginAttempts.set(identifier, recentAttempts);

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - recentAttempts.length,
  };
}

// Input validation function
function validateLoginInput(email, password) {
  const errors = [];

  // Email validation
  if (!email || typeof email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }
    // Sanitize email - remove any potential script tags or special characters
    email = email.trim().toLowerCase();
  }

  // Password validation
  if (!password || typeof password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  // Check for potential injection patterns
  const injectionPatterns = [
    /[<>]/g, // HTML tags
    /javascript:/gi, // JavaScript protocol
    /\$ne|\$gt|\$lt|\$regex|\$where/gi, // MongoDB operators
    /union|select|insert|update|delete|drop/gi, // SQL keywords
  ];

  const combinedInput = `${email} ${password}`;
  for (const pattern of injectionPatterns) {
    if (pattern.test(combinedInput)) {
      errors.push("Invalid characters detected in input");
      break;
    }
  }

  return { isValid: errors.length === 0, errors, sanitizedEmail: email };
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Rate limiting check
    const rateLimit = checkRateLimit(
      email || req.headers.get("x-forwarded-for") || "unknown"
    );
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.remainingTime / (60 * 1000));
      return new Response(
        JSON.stringify({
          message: `Too many login attempts. Please try again in ${minutes} minutes.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(rateLimit.remainingTime / 1000),
          },
        }
      );
    }

    // Validate and sanitize input
    const validation = validateLoginInput(email, password);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          message: "Validation failed",
          errors: validation.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Forwarding login request to backend:", {
      email: validation.sanitizedEmail,
      password: "***", // Don't log passwords
    });

    const res = await axiosInstance.post(
      "https://dnb-backend-api.onrender.com/api/auth/login",
      {
        email: validation.sanitizedEmail,
        password,
      }
    );

    console.log("Backend response:", {
      success: res.data.success,
      user: res.data.user ? "User data received" : "No user data",
    });

    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in login API route:", error.message);
    console.error("Error details:", error.response?.data || error);

    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        details: error.response?.data || error.message,
      }),
      {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
