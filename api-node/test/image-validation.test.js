const test = require("node:test");
const assert = require("node:assert/strict");
const {
  imageFile,
  validPng,
  validJpeg,
} = require("./helpers/test-utils");
const {
  validateImageFile,
} = require("../src/services/storage/image-validation.service");

test("accepts a JPEG signature with a JPEG MIME type", () => {
  assert.equal(validateImageFile(imageFile(validJpeg, "image/jpeg")), true);
});

test("accepts the legacy image/jpg MIME type", () => {
  assert.equal(validateImageFile(imageFile(validJpeg, "image/jpg")), true);
});

test("accepts a valid PNG signature", () => {
  assert.equal(validateImageFile(imageFile(validPng, "image/png")), true);
});

test("rejects a missing file", () => {
  assert.throws(() => validateImageFile(null), {
    statusCode: 400,
    message: "Image file is required",
  });
});

test("rejects an empty buffer", () => {
  assert.throws(
    () => validateImageFile(imageFile(Buffer.alloc(0), "image/png")),
    { statusCode: 400 },
  );
});

test("rejects unsupported declared MIME types", () => {
  assert.throws(
    () => validateImageFile(imageFile(validJpeg, "image/gif")),
    { statusCode: 400, message: "Only JPG, JPEG and PNG images are allowed" },
  );
});

test("rejects content whose signature does not match the declared type", () => {
  assert.throws(
    () => validateImageFile(imageFile(Buffer.from("not an image"), "image/png")),
    { statusCode: 400, message: /not a valid JPG or PNG image/ },
  );
});

test("rejects a PNG declaration when the bytes are a JPEG", () => {
  assert.throws(
    () => validateImageFile(imageFile(validJpeg, "image/png")),
    { statusCode: 400 },
  );
});

test("rejects an SVG disguised as a raster image", () => {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  );
  assert.throws(
    () => validateImageFile(imageFile(svg, "image/png")),
    { statusCode: 400 },
  );
});

test("rejects a truncated PNG without IHDR dimensions", () => {
  const truncated = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d,
  ]);
  assert.throws(
    () => validateImageFile(imageFile(truncated, "image/png")),
    { statusCode: 400 },
  );
});
