// util/barcode.js
/**
 * Retail and Internal/Custom barcode validation and format resolution utilities.
 */

/**
 * Validates internal/custom barcode strings of variable length (e.g. 0000000166).
 * @param {string} code 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateInternalBarcode(code) {
  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      isValid: false,
      error: "Internal barcode value cannot be empty.",
    };
  }

  const clean = code.trim();

  // Internal barcodes can be variable-length numeric or standard ASCII characters (Code 128)
  // eslint-disable-next-line no-control-regex
  if (!/^[\x00-\x7F]+$/.test(clean)) {
    return {
      isValid: false,
      error: "Internal barcode contains unsupported non-ASCII characters.",
    };
  }

  if (clean.length > 80) {
    return {
      isValid: false,
      error: "Barcode length exceeds maximum limit of 80 characters.",
    };
  }

  return { isValid: true };
}

/**
 * Validates EAN-13 barcode checksum.
 * @param {string} code 
 * @returns {boolean}
 */
export function validateEAN13Checksum(code) {
  if (typeof code !== "string" || !/^\d{13}$/.test(code.trim())) {
    return false;
  }
  const digits = code.trim().split("").map(Number);
  const sum = digits.slice(0, 12).reduce((acc, digit, idx) => {
    return acc + (idx % 2 === 0 ? digit : digit * 3);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return digits[12] === expectedCheckDigit;
}

/**
 * Calculates the expected EAN-13 check digit for 12 digits.
 * @param {string} code12 
 * @returns {number|null}
 */
export function calculateEAN13CheckDigit(code12) {
  if (typeof code12 !== "string" || !/^\d{12}$/.test(code12.trim())) {
    return null;
  }
  const digits = code12.trim().split("").map(Number);
  const sum = digits.reduce((acc, digit, idx) => {
    return acc + (idx % 2 === 0 ? digit : digit * 3);
  }, 0);
  return (10 - (sum % 10)) % 10;
}

/**
 * Validates EAN-8 barcode checksum.
 * @param {string} code 
 * @returns {boolean}
 */
export function validateEAN8Checksum(code) {
  if (typeof code !== "string" || !/^\d{8}$/.test(code.trim())) {
    return false;
  }
  const digits = code.trim().split("").map(Number);
  const sum = digits.slice(0, 7).reduce((acc, digit, idx) => {
    return acc + (idx % 2 === 0 ? digit * 3 : digit);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return digits[7] === expectedCheckDigit;
}

/**
 * Validates UPC-A barcode checksum.
 * @param {string} code 
 * @returns {boolean}
 */
export function validateUPCAChecksum(code) {
  if (typeof code !== "string" || !/^\d{12}$/.test(code.trim())) {
    return false;
  }
  const digits = code.trim().split("").map(Number);
  const sum = digits.slice(0, 11).reduce((acc, digit, idx) => {
    return acc + (idx % 2 === 0 ? digit * 3 : digit);
  }, 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return digits[11] === expectedCheckDigit;
}

/**
 * Detects the best barcode format for rendering with JsBarcode.
 * Supports internal variable-length barcodes, auto-detection, or strict format enforcement.
 * 
 * @param {string} rawCode 
 * @param {string} requestedFormat "auto" | "INTERNAL" | "CODE128" | "EAN13" | "UPC" | "EAN8"
 * @returns {{ format: string|null, label: string|null, isValid: boolean, error?: string, warning?: string, isInternal?: boolean }}
 */
export function resolveBarcodeFormat(rawCode, requestedFormat = "auto") {
  if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
    return {
      format: null,
      label: null,
      isValid: false,
      error: "Barcode value cannot be empty.",
    };
  }

  const code = rawCode.trim();

  // 1. Explicit Internal / Custom Barcode
  if (requestedFormat === "INTERNAL" || requestedFormat === "CUSTOM") {
    const val = validateInternalBarcode(code);
    if (!val.isValid) {
      return {
        format: null,
        label: null,
        isValid: false,
        error: val.error,
      };
    }
    return {
      format: "CODE128",
      label: "Internal (Code 128)",
      isValid: true,
      isInternal: true,
    };
  }

  // 2. Explicit EAN-13 (Strict)
  if (requestedFormat === "EAN13") {
    if (!/^\d{13}$/.test(code)) {
      return {
        format: null,
        label: "EAN-13",
        isValid: false,
        error: `EAN-13 requires exactly 13 numeric digits (currently ${code.length}).`,
      };
    }
    if (!validateEAN13Checksum(code)) {
      const expected = calculateEAN13CheckDigit(code.slice(0, 12));
      return {
        format: null,
        label: "EAN-13",
        isValid: false,
        error: `Invalid EAN-13 checksum: last digit is ${code[12]}, expected ${expected}.`,
      };
    }
    return { format: "EAN13", label: "EAN-13", isValid: true };
  }

  // 3. Explicit EAN-8 (Strict)
  if (requestedFormat === "EAN8") {
    if (!/^\d{8}$/.test(code)) {
      return {
        format: null,
        label: "EAN-8",
        isValid: false,
        error: `EAN-8 requires exactly 8 numeric digits (currently ${code.length}).`,
      };
    }
    if (!validateEAN8Checksum(code)) {
      return {
        format: null,
        label: "EAN-8",
        isValid: false,
        error: `Invalid EAN-8 checksum digit for "${code}".`,
      };
    }
    return { format: "EAN8", label: "EAN-8", isValid: true };
  }

  // 4. Explicit UPC-A (Strict)
  if (requestedFormat === "UPC") {
    if (!/^\d{12}$/.test(code)) {
      return {
        format: null,
        label: "UPC-A",
        isValid: false,
        error: `UPC-A requires exactly 12 numeric digits (currently ${code.length}).`,
      };
    }
    if (!validateUPCAChecksum(code)) {
      return {
        format: null,
        label: "UPC-A",
        isValid: false,
        error: `Invalid UPC-A checksum digit for "${code}".`,
      };
    }
    return { format: "UPC", label: "UPC-A", isValid: true };
  }

  // 5. Explicit CODE128
  if (requestedFormat === "CODE128") {
    // eslint-disable-next-line no-control-regex
    if (!/^[\x00-\x7F]+$/.test(code)) {
      return {
        format: null,
        label: "Code 128",
        isValid: false,
        error: "Code 128 only supports standard ASCII characters.",
      };
    }
    return { format: "CODE128", label: "Code 128", isValid: true };
  }

  // 6. AUTO RESOLUTION (requestedFormat === "auto")
  // Check retail formats first if length & checksum match
  if (/^\d{13}$/.test(code)) {
    if (validateEAN13Checksum(code)) {
      return { format: "EAN13", label: "EAN-13", isValid: true };
    }
    return {
      format: "CODE128",
      label: "Internal (Code 128)",
      isValid: true,
      warning: "13 digits without standard EAN checksum rendered as Code 128.",
    };
  }

  if (/^\d{12}$/.test(code)) {
    if (validateUPCAChecksum(code)) {
      return { format: "UPC", label: "UPC-A", isValid: true };
    }
    return {
      format: "CODE128",
      label: "Internal (Code 128)",
      isValid: true,
      warning: "12 digits without standard UPC checksum rendered as Code 128.",
    };
  }

  if (/^\d{8}$/.test(code)) {
    if (validateEAN8Checksum(code)) {
      return { format: "EAN8", label: "EAN-8", isValid: true };
    }
    return {
      format: "CODE128",
      label: "Internal (Code 128)",
      isValid: true,
    };
  }

  // Variable-length numeric strings (e.g. 10 digits like 0000000166 or 1234567890)
  // are classified as Internal Barcodes and rendered with Code 128!
  if (/^\d+$/.test(code)) {
    return {
      format: "CODE128",
      label: "Internal (Code 128)",
      isValid: true,
      isInternal: true,
    };
  }

  // Alphanumeric strings (e.g. PRD10001)
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]+$/.test(code)) {
    return {
      format: "CODE128",
      label: "Code 128",
      isValid: true,
    };
  }

  return {
    format: null,
    label: null,
    isValid: false,
    error: "Barcode contains unsupported characters.",
  };
}
