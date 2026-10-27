const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const express = require("express");
const {
  apiRoot,
  clearRequire,
  freshRequire,
  replaceModule,
  validJpeg,
} = require("./helpers/test-utils");

const servicePath = path.join(apiRoot, "src/services/product.service.js");
const repoPath = path.join(apiRoot, "src/repositories/product.repository.js");
const storagePath = path.join(
  apiRoot,
  "src/services/storage/image-storage.service.js",
);
const errorHandler = require("../src/middleware/errorHandler");

const sampleProduct = {
  category_id: 1,
  name: "Retail Item",
  barcode: "001234567890",
  qty: 10,
  min_stock: 2,
  price: 9.99,
  cost_price: 5.0,
  discount: 0,
  status: 1,
};

const setup = () => {
  const state = {
    products: new Map(),
    nextId: 100,
    uploadCalls: [],
    deleteCalls: [],
  };

  const repository = {
    async create(data) {
      const id = ++state.nextId;
      const record = { id, ...data };
      state.products.set(id, record);
      return id;
    },
    async update(id, data) {
      if (!state.products.has(Number(id))) return 0;
      const current = state.products.get(Number(id));
      state.products.set(Number(id), { ...current, ...data });
      return 1;
    },
    async getById(id) {
      return state.products.get(Number(id)) || null;
    },
    async getByBarcode(barcode) {
      for (const p of state.products.values()) {
        if (p.barcode === barcode) return p;
      }
      return null;
    },
    async remove(id) {
      return state.products.delete(Number(id)) ? 1 : 0;
    },
  };

  const storage = {
    async uploadImage(file, folderKey) {
      state.uploadCalls.push({ file, folderKey });
      return {
        image: `https://res.cloudinary.com/demo/image/upload/pos/${folderKey}/photo-${Date.now()}.jpg`,
        publicId: `pos/${folderKey}/mock-uuid`,
      };
    },
    async safeDeleteImage(reference, context) {
      state.deleteCalls.push({ reference, context });
      return { deleted: true };
    },
  };

  const restoreRepo = replaceModule(repoPath, repository);
  const restoreStorage = replaceModule(storagePath, storage);
  const service = freshRequire(servicePath);

  const cleanup = () => {
    clearRequire(servicePath);
    restoreStorage();
    restoreRepo();
  };

  return { service, state, cleanup };
};

test("Barcode: supports EAN-13, EAN-8, UPC-A, UPC-E, and Code-128 barcode strings", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const testCodes = [
    "4006381333931", // EAN-13
    "96385074",      // EAN-8
    "012345678905",  // UPC-A (with leading zero)
    "0123456",       // UPC-E
    "CODE128-ITEM",  // Code 128 alphanumeric
  ];

  for (const code of testCodes) {
    const id = await service.createProduct(
      { ...sampleProduct, name: `Item ${code}`, barcode: code },
      "tester",
      null,
    );
    assert.ok(id > 0);

    const found = await service.getProductByBarcode(code);
    assert.equal(found.barcode, code);
    assert.strictEqual(typeof found.barcode, "string");
  }
});

test("Barcode: preserves leading zeros without numerical truncation", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const codeWithLeadingZeros = "00000123456789";
  const id = await service.createProduct(
    { ...sampleProduct, barcode: codeWithLeadingZeros },
    "tester",
    null,
  );

  const product = await service.getProductById(id);
  assert.equal(product.barcode, "00000123456789");
  assert.equal(product.barcode.length, 14);

  const byBarcode = await service.getProductByBarcode("00000123456789");
  assert.equal(byBarcode.id, id);
});

test("Barcode: rejects duplicate barcode across different products", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  await service.createProduct(
    { ...sampleProduct, barcode: "8888888888" },
    "tester",
    null,
  );

  await assert.rejects(
    () =>
      service.createProduct(
        { ...sampleProduct, name: "Second product", barcode: "8888888888" },
        "tester",
        null,
      ),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already belongs to another product/);
      return true;
    },
  );
});

test("Barcode: allows updating a product while keeping its existing barcode", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const id = await service.createProduct(
    { ...sampleProduct, barcode: "999888777" },
    "tester",
    null,
  );

  const affected = await service.updateProduct(
    id,
    { ...sampleProduct, name: "Updated Name", barcode: "999888777" },
    null,
  );

  assert.equal(affected, 1);
  const updated = await service.getProductById(id);
  assert.equal(updated.name, "Updated Name");
  assert.equal(updated.barcode, "999888777");
});

test("Barcode: rejects updating to another product's barcode", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  await service.createProduct(
    { ...sampleProduct, barcode: "TAKEN-BARCODE" },
    "tester",
    null,
  );

  const id2 = await service.createProduct(
    { ...sampleProduct, name: "Second Item", barcode: "ORIGINAL-BARCODE" },
    "tester",
    null,
  );

  await assert.rejects(
    () =>
      service.updateProduct(
        id2,
        { ...sampleProduct, barcode: "TAKEN-BARCODE" },
        null,
      ),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already belongs to another product/);
      return true;
    },
  );
});

test("Barcode: unknown barcode lookup returns 404", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(
    () => service.getProductByBarcode("NONEXISTENT-CODE"),
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.equal(err.message, "Product not found");
      return true;
    },
  );
});

test("Photo Capture: camera photo submits through standard upload flow and stores image", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  // Simulated photo captured by CameraCaptureModal
  const mockCameraFile = {
    buffer: validJpeg,
    mimetype: "image/jpeg",
    originalname: "camera-capture.jpg",
  };

  const id = await service.createProduct(
    { ...sampleProduct, barcode: "CAMERA-PHOTO-ITEM" },
    "tester",
    mockCameraFile,
  );

  assert.ok(id > 0);
  assert.equal(state.uploadCalls.length, 1);
  assert.equal(state.uploadCalls[0].folderKey, "products");

  const created = await service.getProductById(id);
  assert.match(created.image, /^https:\/\/res\.cloudinary\.com\//);
  assert.equal(created.image_public_id, "pos/products/mock-uuid");
});

test("Photo Capture: replacing with new camera photo deletes previous image after DB update", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const firstPhoto = {
    buffer: validJpeg,
    mimetype: "image/jpeg",
    originalname: "first-photo.jpg",
  };

  const id = await service.createProduct(
    { ...sampleProduct, barcode: "REPLACE-PHOTO-ITEM" },
    "tester",
    firstPhoto,
  );

  const secondPhoto = {
    buffer: validJpeg,
    mimetype: "image/jpeg",
    originalname: "retake-photo.jpg",
  };

  await service.updateProduct(
    id,
    { ...sampleProduct, barcode: "REPLACE-PHOTO-ITEM" },
    secondPhoto,
  );

  assert.equal(state.uploadCalls.length, 2);
  assert.equal(state.deleteCalls.length, 1);
  assert.equal(state.deleteCalls[0].reference.publicId, "pos/products/mock-uuid");
});
