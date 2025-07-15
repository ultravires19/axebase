/**
 * Form validation utilities for authentication forms
 * Provides validation functions for email, password, and other form fields
 */

/**
 * Email validation using a regular expression
 * Checks for a valid email format (user@domain.tld)
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email.trim()) {
    return { valid: false, message: "Email is required" };
  }

  // Basic email regex - can be made more sophisticated if needed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  return { valid: true };
};

/**
 * Password validation
 * Ensures password meets security requirements
 */
export const validatePassword = (
  password: string
): { valid: boolean; message?: string; strength?: "weak" | "medium" | "strong" } => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  // Check for at least one letter
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter" };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }

  // Determine password strength
  let strength: "weak" | "medium" | "strong" = "weak";

  // Medium: at least 8 chars with letters and numbers
  if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
    strength = "medium";
  }

  // Strong: at least 10 chars with letters, numbers, and special chars
  if (
    password.length >= 10 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    strength = "strong";
  }

  return { valid: true, strength };
};

/**
 * Name validation
 * Ensures names meet basic requirements
 */
export const validateName = (
  name: string,
  fieldName: string = "Name"
): { valid: boolean; message?: string } => {
  if (!name.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (name.length < 2) {
    return { valid: false, message: `${fieldName} must be at least 2 characters` };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[A-Za-z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return {
      valid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    };
  }

  return { valid: true };
};

/**
 * Form fields validation
 * Validates a form object with multiple fields
 */
export const validateForm = <T extends Record<string, any>>(
  form: T,
  validations: Record<keyof T, (value: any) => { valid: boolean; message?: string }>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const field in validations) {
    if (Object.prototype.hasOwnProperty.call(validations, field)) {
      const result = validations[field](form[field]);
      if (!result.valid) {
        errors[field] = result.message;
        valid = false;
      }
    }
  }

  return { valid, errors };
};

/**
 * Registration form validation
 */
export const validateRegistration = (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    errors.email = emailResult.message || "Invalid email";
  }

  // Validate password
  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    errors.password = passwordResult.message || "Invalid password";
  }

  // Validate first name if provided
  if (data.firstName) {
    const firstNameResult = validateName(data.firstName, "First name");
    if (!firstNameResult.valid) {
      errors.firstName = firstNameResult.message || "Invalid first name";
    }
  }

  // Validate last name if provided
  if (data.lastName) {
    const lastNameResult = validateName(data.lastName, "Last name");
    if (!lastNameResult.valid) {
      errors.lastName = lastNameResult.message || "Invalid last name";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Login form validation
 */
export const validateLogin = (data: {
  email: string;
  password: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    errors.email = emailResult.message || "Invalid email";
  }

  // For login, we just check if password is provided
  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
