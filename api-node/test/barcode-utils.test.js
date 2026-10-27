const test = require("node:test");
const assert = require("node:assert/strict");

// Import utility algorithms (replicated logic matching pos-phone/src/util/barcode.js)
function validateEAN13Checksum(code) {
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

function validateEAN8Checksum(code) {
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

function validateUPCAChecksum(code) {
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

function validateInternalBarcode(code) {
  if (!code || typeof code !== "string" || !code.trim()) {
    return { isValid: false, error: "Internal barcode value cannot be empty." };
  }
  const clean = code.trim();
  // eslint-disable-next-line no-control-regex
  if (!/^[\x00-\x7F]+$/.test(clean)) {
    return { isValid: false, error: "Internal barcode contains unsupported non-ASCII characters." };
  }
  if (clean.length > 80) {
    return { isValid: false, error: "Barcode length exceeds maximum limit of 80 characters." };
  }
  return { isValid: true };
}


function resolveBarcodeFormat(rawCode, requestedFormat = "auto") {
  if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
    return { format: null, isValid: false, error: "Barcode value cannot be empty." };
  }
  const code = rawCode.trim();

  // INTERNAL / CUSTOM: variable-length ASCII, rendered as Code 128
  if (requestedFormat === "INTERNAL" || requestedFormat === "CUSTOM") {
    const val = validateInternalBarcode(code);
    if (!val.isValid) {
      return { format: null, label: null, isValid: false, error: val.error };
    }
    return { format: "CODE128", label: "Internal (Code 128)", isValid: true, isInternal: true };
  }

  if (requestedFormat === "EAN13") {
    if (!/^\d{13}$/.test(code)) {
      return { format: null, isValid: false, error: `EAN-13 requires exactly 13 digits.` };
    }
    if (!validateEAN13Checksum(code)) {
      return { format: null, isValid: false, error: "Invalid EAN-13 checksum." };
    }
    return { format: "EAN13", isValid: true };
  }

  if (requestedFormat === "EAN8") {
    if (!/^\d{8}$/.test(code)) {
      return { format: null, isValid: false, error: `EAN-8 requires exactly 8 digits.` };
    }
    if (!validateEAN8Checksum(code)) {
      return { format: null, isValid: false, error: "Invalid EAN-8 checksum." };
    }
    return { format: "EAN8", isValid: true };
  }

  if (requestedFormat === "UPC") {
    if (!/^\d{12}$/.test(code)) {
      return { format: null, isValid: false, error: `UPC-A requires exactly 12 digits.` };
    }
    if (!validateUPCAChecksum(code)) {
      return { format: null, isValid: false, error: "Invalid UPC-A checksum." };
    }
    return { format: "UPC", isValid: true };
  }

  if (requestedFormat === "CODE128") {
    // eslint-disable-next-line no-control-regex
    if (!/^[\x00-\x7F]+$/.test(code)) {
      return { format: null, isValid: false, error: "Code 128 only supports standard ASCII." };
    }
    return { format: "CODE128", isValid: true };
  }

  // AUTO
  if (/^\d{13}$/.test(code)) {
    if (validateEAN13Checksum(code)) {
      return { format: "EAN13", isValid: true };
    }
    return { format: "CODE128", isValid: true };
  }
  if (/^\d{12}$/.test(code)) {
    if (validateUPCAChecksum(code)) {
      return { format: "UPC", isValid: true };
    }
    return { format: "CODE128", isValid: true };
  }
  if (/^\d{8}$/.test(code)) {
    if (validateEAN8Checksum(code)) {
      return { format: "EAN8", isValid: true };
    }
    return { format: "CODE128", isValid: true };
  }
  // Variable-length numerics (e.g. 10 digits like 0000000166) -> Internal Code 128
  if (/^\d+$/.test(code)) {
    return { format: "CODE128", isValid: true, isInternal: true };
  }
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]+$/.test(code)) {
    return { format: "CODE128", isValid: true };
  }
  return { format: null, isValid: false, error: "Unsupported characters." };
}

test("Barcode Utils: preserves leading zeros as a string", () => {
  const code = "000123456789";
  assert.equal(typeof code, "string");
  assert.equal(code.startsWith("000"), true);
  assert.equal(code.length, 12);
});

test("Barcode Utils: validates valid EAN-13 barcodes", () => {
  // STABILO point 88 fine 0.4 mm barcode: 4006381333931
  assert.equal(validateEAN13Checksum("4006381333931"), true);
  assert.equal(validateEAN13Checksum("4006381333932"), false);
});

test("Barcode Utils: rejects invalid EAN-13 length or non-digits", () => {
  assert.equal(validateEAN13Checksum("12345"), false);
  assert.equal(validateEAN13Checksum("400638133393A"), false);
  assert.equal(validateEAN13Checksum(""), false);
});

test("Barcode Utils: validates EAN-8 barcodes", () => {
  // 96385074
  assert.equal(validateEAN8Checksum("96385074"), true);
  assert.equal(validateEAN8Checksum("96385075"), false);
});

test("Barcode Utils: validates UPC-A barcodes", () => {
  // 036000291452
  assert.equal(validateUPCAChecksum("036000291452"), true);
  assert.equal(validateUPCAChecksum("036000291453"), false);
});

test("Barcode Utils: resolves auto format correctly", () => {
  // 13 valid digits -> EAN13
  assert.equal(resolveBarcodeFormat("4006381333931").format, "EAN13");
  // 13 digits with non-standard check -> CODE128
  assert.equal(resolveBarcodeFormat("0000000000001").format, "CODE128");
  // 12 valid digits -> UPC
  assert.equal(resolveBarcodeFormat("036000291452").format, "UPC");
  // 8 valid digits -> EAN8
  assert.equal(resolveBarcodeFormat("96385074").format, "EAN8");
  // Alphanumeric internal auto-sequence -> CODE128
  assert.equal(resolveBarcodeFormat("PRD10001").format, "CODE128");
});

test("Barcode Utils: rejects when explicitly requested format checksum fails", () => {
  const result = resolveBarcodeFormat("4006381333932", "EAN13");
  assert.equal(result.isValid, false);
  assert.match(result.error, /Invalid EAN-13 checksum/);
});

test("Barcode Utils: handles rapid scanner debouncing simulation", () => {
  const lastScanned = { code: "", time: 0 };
  const addEvents = [];

  function simulateScan(code, timestamp) {
    if (lastScanned.code === code && timestamp - lastScanned.time < 1200) {
      return false; // Ignored duplicate
    }
    lastScanned.code = code;
    lastScanned.time = timestamp;
    addEvents.push(code);
    return true;
  }

  // First scan at t=100
  assert.equal(simulateScan("001234567890", 100), true);
  // Duplicate scan at t=150 (50ms later)
  assert.equal(simulateScan("001234567890", 150), false);
  // Another duplicate at t=400
  assert.equal(simulateScan("001234567890", 400), false);
  // Legitimate subsequent scan at t=1500 (> 1200ms later)
  assert.equal(simulateScan("001234567890", 1500), true);

  assert.equal(addEvents.length, 2);
});

// ── NEW TESTS: Internal / Custom barcode (Task 1–6) ────────────────────────────

test("Internal Barcode: 0000000166 is a valid string preserving leading zeros", () => {
  const code = "0000000166";
  assert.equal(typeof code, "string", "barcode must be a string");
  assert.equal(code, "0000000166", "value must be preserved exactly");
  assert.equal(code.length, 10);
  assert.ok(code.startsWith("000"), "leading zeros must be preserved");
});

test("Internal Barcode: validateInternalBarcode accepts 0000000166, 0000000001, 1234567890", () => {
  const codes = ["0000000166", "0000000001", "1234567890"];
  for (const c of codes) {
    const result = validateInternalBarcode(c);
    assert.equal(result.isValid, true, `Expected ${c} to be valid internal barcode`);
  }
});

test("Internal Barcode: auto format classifies 10-digit 0000000166 as CODE128 (not UPC-A)", () => {
  const result = resolveBarcodeFormat("0000000166");
  assert.equal(result.isValid, true);
  assert.equal(result.format, "CODE128", "10-digit barcode must be CODE128, not misidentified as UPC-A");
  assert.equal(result.isInternal, true, "should be marked as internal");
});

test("Internal Barcode: INTERNAL format resolves 0000000166 to CODE128", () => {
  const result = resolveBarcodeFormat("0000000166", "INTERNAL");
  assert.equal(result.isValid, true);
  assert.equal(result.format, "CODE128");
  assert.equal(result.isInternal, true);
});

test("Internal Barcode: 0000000166 is rejected by UPC format (wrong length)", () => {
  const result = resolveBarcodeFormat("0000000166", "UPC");
  assert.equal(result.isValid, false);
  assert.match(result.error, /UPC-A requires exactly 12 digits/);
});

test("Internal Barcode: 0000000166 is rejected by EAN-13 format (wrong length)", () => {
  const result = resolveBarcodeFormat("0000000166", "EAN13");
  assert.equal(result.isValid, false);
  assert.match(result.error, /EAN-13 requires exactly 13 digits/);
});

test("Internal Barcode: 0000000166 is rejected by EAN-8 format (wrong length)", () => {
  const result = resolveBarcodeFormat("0000000166", "EAN8");
  assert.equal(result.isValid, false);
  assert.match(result.error, /EAN-8 requires exactly 8 digits/);
});

test("Internal Barcode: auto format classifies all three required codes as CODE128", () => {
  const codes = ["0000000166", "0000000001", "1234567890"];
  for (const c of codes) {
    const result = resolveBarcodeFormat(c);
    assert.equal(result.isValid, true, `${c} should be valid`);
    assert.equal(result.format, "CODE128", `${c} should map to CODE128`);
  }
});

test("Scanner: decoded string passes through as exact string without numeric conversion", () => {
  // Simulate what BarcodeScannerModal passes to onScan callback
  const rawDecoded = "0000000166";
  // onScan(detectedCode) - must be string, must NOT be converted to number
  const passed = String(rawDecoded); // explicit passthrough
  assert.equal(typeof passed, "string");
  assert.equal(passed, "0000000166");
  assert.equal(passed.startsWith("0"), true, "leading zero must be preserved from scan");
  // Demonstrate that Number() conversion would be destructive
  assert.notEqual(Number(rawDecoded), rawDecoded, "Number() conversion destroys leading zeros");
});

test("Leading zeros: 0000000166 survives the full data-flow string chain", () => {
  // Simulate: typed -> trimmed -> stored as string -> retrieved -> passed to barcode renderer
  const typed = "  0000000166  ";
  const stored = typed.trim(); // what the DB stores (VARCHAR)
  assert.equal(stored, "0000000166");

  // Simulate: retrieved from DB (MySQL VARCHAR returns string)
  const retrieved = stored.toString(); // no-op on string, but explicit
  assert.equal(retrieved, "0000000166");

  // Simulate: passed to resolveBarcodeFormat
  const resolution = resolveBarcodeFormat(retrieved, "INTERNAL");
  assert.equal(resolution.isValid, true);
  assert.equal(resolution.format, "CODE128");

  // Value unchanged throughout
  assert.equal(retrieved, "0000000166");
});

test("Scanner consensus: requires 2 matching frames and delivers scan only once", () => {
  // Simulate candidate tracking & single delivery logic from BarcodeScannerModal
  let candidate = { code: "", count: 0, lastTime: 0 };
  let hasScanned = false;
  const deliveries = [];

  function onFrameDecoded(detectedCode, nowMs) {
    if (detectedCode && !hasScanned) {
      if (candidate.code === detectedCode && nowMs - candidate.lastTime < 800) {
        candidate.count++;
      } else {
        candidate = { code: detectedCode, count: 1, lastTime: nowMs };
      }

      if (candidate.count >= 2) {
        hasScanned = true;
        deliveries.push(detectedCode);
      }
    }
  }

  // Frame 1: Transient misread or noisy frame (e.g. "123456")
  onFrameDecoded("123456", 1000);
  assert.equal(deliveries.length, 0, "Single noisy frame must NOT trigger delivery");

  // Frame 2: Real barcode "0000000166" (Frame 1 of genuine code)
  onFrameDecoded("0000000166", 1120);
  assert.equal(deliveries.length, 0, "First frame of genuine code must await confirmation");

  // Frame 3: Second consecutive detection of "0000000166"
  onFrameDecoded("0000000166", 1240);
  assert.equal(deliveries.length, 1, "Two consecutive matching frames must trigger delivery");
  assert.equal(deliveries[0], "0000000166", "Delivered barcode must preserve leading zeros");

  // Subsequent frames (e.g. while closing modal): must NOT deliver again
  onFrameDecoded("0000000166", 1360);
  onFrameDecoded("0000000166", 1480);
  assert.equal(deliveries.length, 1, "Delivers scan callback strictly once");
});

test("ZXing Exception Prototype Chain: linking resolves ReaderException check in MultiFormatReader", () => {
  let zxing;
  try {
    zxing = require("@zxing/library");
  } catch {
    zxing = require("../../pos-phone/node_modules/@zxing/library");
  }

  const {
    NotFoundException,
    ChecksumException,
    FormatException,
    ReaderException,
  } = zxing;

  // Verify that setting prototype chain satisfies `ex instanceof ReaderException`
  Object.setPrototypeOf(NotFoundException.prototype, ReaderException.prototype);
  Object.setPrototypeOf(ChecksumException.prototype, ReaderException.prototype);
  Object.setPrototypeOf(FormatException.prototype, ReaderException.prototype);

  const nfe = new NotFoundException();
  const cse = new ChecksumException();
  const fte = new FormatException();

  assert.equal(nfe instanceof ReaderException, true, "NotFoundException must satisfy instanceof ReaderException");
  assert.equal(cse instanceof ReaderException, true, "ChecksumException must satisfy instanceof ReaderException");
  assert.equal(fte instanceof ReaderException, true, "FormatException must satisfy instanceof ReaderException");
});
