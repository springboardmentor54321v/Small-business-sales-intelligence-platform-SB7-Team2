// ==========================================
// MarketMind AI - Input Sanitizer & Security Middleware
// Module: Security & API Gateway (Milestone Day 8)
// Features: XSS Protection, SQLi Detection, NoSQLi & Prototype Pollution Stripping
// ==========================================

/**
 * Sanitize a string against XSS (script tags, event handlers, javascript: URIs)
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Remove script tags and HTML tags
  let clean = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<[^>]*>/g, ""); // Strip all HTML tags

  // Neutralize javascript: URIs and dangerous event attributes
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/on\w+\s*=/gi, "");

  return clean.trim();
};

/**
 * SQL Injection Pattern Checker
 */
const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|UNION|EXEC|EXECUTE)\b|\bOR\b\s+['"]?1['"]?\s*=\s*['"]?1['"]?|--|\/\*|\*\/)/i;

/**
 * Recursively inspect and sanitize an object/array
 */
const recursiveSanitize = (obj, containsSqlInjectionRef) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    if (sqlInjectionPattern.test(obj)) {
      containsSqlInjectionRef.detected = true;
    }
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => recursiveSanitize(item, containsSqlInjectionRef));
  }

  if (typeof obj === "object") {
    const cleanObj = {};
    for (const key of Object.keys(obj)) {
      // Prototype pollution & NoSQL injection operator stripping ($key, __proto__, constructor, prototype)
      if (key.startsWith("$") || key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      cleanObj[key] = recursiveSanitize(obj[key], containsSqlInjectionRef);
    }
    return cleanObj;
  }

  return obj;
};

/**
 * Global Sanitizer & Injection Protection Middleware
 */
const sanitizerMiddleware = (req, res, next) => {
  const sqlCheck = { detected: false };

  if (req.body && typeof req.body === "object") {
    req.body = recursiveSanitize(req.body, sqlCheck);
  }

  if (req.query && typeof req.query === "object") {
    req.query = recursiveSanitize(req.query, sqlCheck);
  }

  if (req.params && typeof req.params === "object") {
    req.params = recursiveSanitize(req.params, sqlCheck);
  }

  if (sqlCheck.detected) {
    return res.status(400).json({
      success: false,
      message: "Security Error: Invalid input or potential injection attempt detected",
      error: "Input security validation failed"
    });
  }

  next();
};

module.exports = sanitizerMiddleware;
