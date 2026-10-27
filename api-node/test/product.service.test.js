const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const {
  apiRoot,
  clearRequire,
  freshRequire,
  replaceModule,
  imageFile,
} = require("./helpers/test-utils");

const servicePath = path.join(apiRoot, "src/services/product.service.js");
const repoPath = path.join(apiRoot, "src/repositories/product.repository.js");
const storagePath = path.join(
  apiRoot,
  "src/services/storage/image-storage.service.js",
);

const productData = {
  category_id: "1",
  barcode: "BAR-000001",
  name: "Test product",
  brand: "Brand",
  description: "Description",
  qty: "2",
  min_stock: "1",
  price: "10",
  cost_price: "5",
  discount: "0",
  status: "1",
};

const setup = () => {
  const state = {
    events: [],
    uploadError: null,
    createError: null,
    updateError: null,
    removeError: null,
    existing: null,
    existingBarcodeProduct: null,
    safeDeleteCalls: [],
    repoCreateArgs: null,
    repoUpdateArgs: null,
  };

  const repository = {
    async create(data, user) {
      state.events.push("db.create");
      state.repoCreateArgs = { data, user };
      if (state.createError) throw state.createError;
      return 42;
    },
    async update(id, data) {
      state.events.push("db.update");
      state.repoUpdateArgs = { id, data };
      if (state.updateError) throw state.updateError;
      return 1;
    },
    async remove(id) {
      state.events.push("db.remove");
      if (state.removeError) throw state.removeError;
      return 1;
    },
    async getById() {
      return state.existing;
    },
    async getByBarcode(barcode) {
      if (state.existingBarcodeProduct && state.existingBarcodeProduct.barcode === barcode) {
        return state.existingBarcodeProduct;
      }
      return null;
    },
    async getTopSale() {
      return [];
    },
    async getSummary() {
      return {};
    },
    async getLastBarcodeNumber() {
      return 0;
    },
    async getAll() {
      return { data: [], pagination: {} };
    },
  };

  const storage = {
    async uploadImage(file, folderKey) {
      state.events.push("storage.upload");
      if (state.uploadError) throw state.uploadError;
      return {
        image: "https://res.cloudinary.com/demo/image/upload/pos/products/new.jpg",
        publicId: "pos/products/new",
        folderKey,
      };
    },
    async safeDeleteImage(reference, context) {
      state.events.push("storage.delete");
      state.safeDeleteCalls.push({ reference, context });
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

test("create uploads to the products folder and persists URL plus public_id", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const id = await service.createProduct(
    { ...productData },
    "cashier",
    imageFile(),
  );

  assert.equal(id, 42);
  assert.equal(state.repoCreateArgs.data.image, "https://res.cloudinary.com/demo/image/upload/pos/products/new.jpg");
  assert.equal(state.repoCreateArgs.data.image_public_id, "pos/products/new");
  assert.equal(state.repoCreateArgs.user, "cashier");
  assert.deepEqual(state.events, ["storage.upload", "db.create"]);
});

test("create without a file stores null image references", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await service.createProduct({ ...productData }, "cashier");

  assert.equal(state.repoCreateArgs.data.image, null);
  assert.equal(state.repoCreateArgs.data.image_public_id, null);
  assert.deepEqual(state.events, ["db.create"]);
});

test("create stops when the Cloudinary upload fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.uploadError = Object.assign(new Error("upload failed"), {
    statusCode: 502,
  });

  await assert.rejects(
    () => service.createProduct({ ...productData }, "cashier", imageFile()),
    /upload failed/,
  );
  assert.equal(state.events.includes("db.create"), false);
  assert.equal(state.safeDeleteCalls.length, 0);
});

test("create deletes the newly uploaded asset when the database insert fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.createError = new Error("db insert failed");

  await assert.rejects(
    () => service.createProduct({ ...productData }, "cashier", imageFile()),
    /db insert failed/,
  );

  assert.equal(state.safeDeleteCalls.length, 1);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/products/new");
  assert.equal(state.safeDeleteCalls[0].reference.folderKey, "products");
});

test("update does not delete the old image before the new reference is saved", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 7,
    image: "https://res.cloudinary.com/demo/image/upload/pos/products/old.jpg",
    image_public_id: "pos/products/old",
  };

  await service.updateProduct(7, { ...productData }, imageFile());

  assert.deepEqual(state.events, [
    "storage.upload",
    "db.update",
    "storage.delete",
  ]);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/products/old");
  assert.equal(state.repoUpdateArgs.data.image_public_id, "pos/products/new");
});

test("update deletes the new asset and preserves the old one when the update fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 7,
    image: "https://res.cloudinary.com/demo/image/upload/pos/products/old.jpg",
    image_public_id: "pos/products/old",
  };
  state.updateError = new Error("db update failed");

  await assert.rejects(
    () => service.updateProduct(7, { ...productData }, imageFile()),
    /db update failed/,
  );

  assert.equal(state.safeDeleteCalls.length, 1);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/products/new");
  assert.equal(
    state.safeDeleteCalls.some(
      (call) => call.reference.publicId === "pos/products/old",
    ),
    false,
  );
});

test("update without a file preserves the existing image and public_id", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 7,
    image: "image-legacy.jpg",
    image_public_id: null,
  };

  await service.updateProduct(7, { ...productData });

  assert.equal(state.repoUpdateArgs.data.image, "image-legacy.jpg");
  assert.equal(state.repoUpdateArgs.data.image_public_id, null);
  assert.equal(state.safeDeleteCalls.length, 0);
  assert.equal(state.events.includes("storage.upload"), false);
});

test("update passes the legacy local reference to storage for safe cleanup", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 7,
    image: "image-legacy.jpg",
    image_public_id: null,
  };

  await service.updateProduct(7, { ...productData }, imageFile());

  assert.equal(state.safeDeleteCalls[0].reference.image, "image-legacy.jpg");
  assert.equal(state.safeDeleteCalls[0].reference.publicId, null);
});

test("delete removes the database row before the image asset", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 7,
    image: "https://res.cloudinary.com/demo/image/upload/pos/products/old.jpg",
    image_public_id: "pos/products/old",
  };

  await service.deleteProduct(7);

  assert.deepEqual(state.events, ["db.remove", "storage.delete"]);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/products/old");
});

test("delete does not touch the image when the database delete fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 7, image: "image-legacy.jpg", image_public_id: null };
  state.removeError = new Error("foreign key");

  await assert.rejects(() => service.deleteProduct(7), /foreign key/);

  assert.deepEqual(state.events, ["db.remove"]);
  assert.equal(state.safeDeleteCalls.length, 0);
});

test("delete keeps legacy local references for the storage layer to handle", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 7, image: "image-legacy.jpg", image_public_id: null };

  await service.deleteProduct(7);

  assert.equal(state.safeDeleteCalls[0].reference.image, "image-legacy.jpg");
  assert.equal(state.safeDeleteCalls[0].reference.folderKey, "products");
});

test("delete reports a missing product without deleting anything", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = null;

  await assert.rejects(() => service.deleteProduct(7), {
    statusCode: 404,
  });
  assert.equal(state.events.length, 0);
});

test("create rejects a duplicate barcode", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existingBarcodeProduct = { id: 10, barcode: "001234567890", name: "Existing" };

  await assert.rejects(
    () => service.createProduct({ ...productData, barcode: "001234567890" }, "admin", null),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already belongs to another product/);
      return true;
    },
  );
  assert.equal(state.events.includes("db.create"), false);
});

test("create preserves leading zeros and trims barcode whitespace", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const id = await service.createProduct(
    { ...productData, barcode: "  000987654321  " },
    "admin",
    null,
  );

  assert.equal(id, 42);
  assert.equal(state.repoCreateArgs.data.barcode, "000987654321");
});

test("update rejects duplicate barcode belonging to a different product", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 7, barcode: "BAR-000007" };
  state.existingBarcodeProduct = { id: 15, barcode: "001234567890" };

  await assert.rejects(
    () => service.updateProduct(7, { ...productData, barcode: "001234567890" }, null),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /already belongs to another product/);
      return true;
    },
  );
  assert.equal(state.events.includes("db.update"), false);
});

test("update allows keeping its own existing barcode", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 7, barcode: "001234567890" };
  state.existingBarcodeProduct = { id: 7, barcode: "001234567890" };

  const affected = await service.updateProduct(
    7,
    { ...productData, barcode: "001234567890" },
    null,
  );

  assert.equal(affected, 1);
  assert.equal(state.repoUpdateArgs.data.barcode, "001234567890");
});

test("getProductByBarcode returns product and preserves barcode string", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existingBarcodeProduct = { id: 5, barcode: "0054321", name: "Leading zero item" };

  const result = await service.getProductByBarcode("0054321");

  assert.deepEqual(result, state.existingBarcodeProduct);
  assert.strictEqual(typeof result.barcode, "string");
  assert.equal(result.barcode, "0054321");
});

test("getProductByBarcode throws 404 when barcode does not exist", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(
    () => service.getProductByBarcode("999999999999"),
    { statusCode: 404, message: "Product not found" },
  );
});

test("getProductByBarcode rejects missing or empty barcode", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(
    () => service.getProductByBarcode(""),
    { statusCode: 400, message: "Barcode is required" },
  );
});

