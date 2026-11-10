export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "trashmail.com",
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates email formatting, syntax, domain validity, and typo suggestions.
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Email address is required.",
    };
  }

  // Length limits
  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: "Email address cannot exceed 254 characters.",
    };
  }

  // RFC 5322 Compliant standard email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email format (e.g. name@example.com).",
    };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: "Email must contain a single '@' character.",
    };
  }

  const [localPart, domain] = parts;

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: "The username portion of the email cannot exceed 64 characters.",
    };
  }

  // Check domain has valid dot and TLD >= 2 characters
  const domainParts = domain.split(".");
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return {
      isValid: false,
      error: "Email domain must have a valid top-level extension (e.g. .com, .edu, .org).",
    };
  }

  // Check for disposable email services
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Disposable and temporary email addresses are not permitted.",
    };
  }

  // Check for common domain typos
  if (COMMON_DOMAIN_TYPOS[domain]) {
    const suggestedEmail = `${localPart}@${COMMON_DOMAIN_TYPOS[domain]}`;
    return {
      isValid: true,
      suggestion: suggestedEmail,
    };
  }

  return { isValid: true };
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required.",
      strength: "weak",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters long.",
      strength: "weak",
    };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strength = score >= 3 ? "strong" : score >= 1 ? "medium" : "weak";

  return {
    isValid: true,
    strength,
  };
}

