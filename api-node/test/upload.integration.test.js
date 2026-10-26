const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const express = require("express");
const upload = require("../src/middleware/upload.middleware");
const errorHandler = require("../src/middleware/errorHandler");
const {
  apiRoot,
  validPng,
  validJpeg,
} = require("./helpers/test-utils");

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const productsDir = path.join(apiRoot, "uploads/products");

const withServer = async (t) => {
  const app = express();
  app.post(
    "/upload",
    upload("products").single("image"),
    (req, res) => {
      res.json({
        hasFile: Boolean(req.file),
        size: req.file ? req.file.buffer.length : 0,
        mimetype: req.file ? req.file.mimetype : null,
        folder: req.uploadFolder || null,
      });
    },
  );
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/upload`;
};

const postImage = async (url, buffer, type, filename = "client-name.exe") => {
  const form = new FormData();
  if (buffer) {
    form.append("image", new Blob([buffer], { type }), filename);
  }
  const response = await fetch(url, { method: "POST", body: form });
  return { response, body: await response.json() };
};

test("accepts a valid image into memory without writing it to uploads", async (t) => {
  const url = await withServer(t);
  const before = fs.readdirSync(productsDir).length;

  const { response, body } = await postImage(
    url,
    validJpeg,
    "image/jpeg",
    "../../evil.php",
  );

  assert.equal(response.status, 200);
  assert.equal(body.hasFile, true);
  assert.equal(body.size, validJpeg.length);
  assert.equal(body.mimetype, "image/jpeg");
  assert.equal(body.folder, "products");
  assert.equal(fs.readdirSync(productsDir).length, before);
});

test("accepts PNG uploads", async (t) => {
  const url = await withServer(t);

  const { response, body } = await postImage(
    url,
    validPng,
    "image/png",
    "logo.png",
  );

  assert.equal(response.status, 200);
  assert.equal(body.hasFile, true);
});

test("missing file is allowed through for optional uploads", async (t) => {
  const url = await withServer(t);

  const { response, body } = await postImage(url);

  assert.equal(response.status, 200);
  assert.equal(body.hasFile, false);
});

test("rejects an unsupported declared MIME type", async (t) => {
  const url = await withServer(t);

  const { response, body } = await postImage(
    url,
    validJpeg,
    "text/plain",
    "payload.txt",
  );

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.match(body.message, /Only JPG, JPEG and PNG images are allowed/);
});

test("rejects a file over the 3 MB limit", async (t) => {
  const url = await withServer(t);
  const oversized = Buffer.alloc(MAX_FILE_SIZE + 1, 0xff);

  const { response, body } = await postImage(
    url,
    oversized,
    "image/jpeg",
    "huge.jpg",
  );

  assert.equal(response.status, 400);
  assert.equal(body.message, "Image must be 3 MB or smaller");
});

test("rejects bytes that do not match the declared image type", async (t) => {
  const url = await withServer(t);

  const { response, body } = await postImage(
    url,
    Buffer.from("<svg onload=alert(1)></svg>"),
    "image/png",
    "image.png",
  );

  assert.equal(response.status, 400);
  assert.match(body.message, /not a valid JPG or PNG image/);
});
