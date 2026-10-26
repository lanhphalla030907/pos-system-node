const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
  clearRequire,
  freshRequire,
  replaceModule,
  validJpeg,
  imageFile,
} = require("./helpers/test-utils");

const apiRoot = path.join(__dirname, "..");
const servicePath = path.join(
  apiRoot,
  "src/services/storage/image-storage.service.js",
);
const cloudinaryPath = path.join(
  apiRoot,
  "src/services/storage/cloudinary.service.js",
);
const productsDir = path.join(apiRoot, "uploads/products");

const setup = (cloudinaryOverrides = {}) => {
  const state = {
    uploadCalls: [],
    destroyCalls: [],
    uploadError: null,
    destroyError: null,
  };

  const cloudinary = {
    uploadBuffer: async (buffer, options) => {
      state.uploadCalls.push({ buffer, options });
      if (state.uploadError) throw state.uploadError;
      return {
        url: `https://res.cloudinary.com/demo/image/upload/${options.folder}/asset.jpg`,
        publicId: `${options.folder}/asset`,
      };
    },
    destroy: async (publicId) => {
      state.destroyCalls.push(publicId);
      if (state.destroyError) throw state.destroyError;
      return { result: "ok" };
    },
    resolveUrl: (publicId) => `https://res.cloudinary.com/demo/${publicId}`,
    ...cloudinaryOverrides,
  };

  const restore = replaceModule(cloudinaryPath, cloudinary);
  const service = freshRequire(servicePath);

  const cleanup = () => {
    clearRequire(servicePath);
    restore();
    delete process.env.CLOUDINARY_FOLDER_PREFIX;
  };

  return { service, state, cleanup };
};

test("uploads to the provider folder for each feature", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  process.env.CLOUDINARY_FOLDER_PREFIX = "portfolio";

  const result = await service.uploadImage(imageFile(), "products");

  assert.equal(state.uploadCalls[0].options.folder, "portfolio/products");
  assert.equal(result.publicId, "portfolio/products/asset");
  assert.match(result.image, /^https:\/\/res\.cloudinary\.com\//);

  await service.uploadImage(imageFile(), "employee");
  assert.equal(state.uploadCalls[1].options.folder, "portfolio/employee");

  await service.uploadImage(imageFile(), "settings");
  assert.equal(state.uploadCalls[2].options.folder, "portfolio/settings");
});

test("validates the file before calling the provider", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(
    () => service.uploadImage(imageFile(Buffer.from("not-an-image"), "image/png"), "products"),
    { statusCode: 400 },
  );
  assert.equal(state.uploadCalls.length, 0);
});

test("deletes a Cloudinary asset when a public_id is present", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.deleteImage({
    image: "https://res.cloudinary.com/demo/image/upload/pos/products/old.jpg",
    publicId: "pos/products/old",
    folderKey: "products",
  });

  assert.deepEqual(result, { deleted: true, type: "cloudinary" });
  assert.deepEqual(state.destroyCalls, ["pos/products/old"]);
});

test("does not treat a Cloudinary URL as a local filename", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.deleteImage({
    image: "https://res.cloudinary.com/demo/image/upload/pos/products/old.jpg",
    publicId: null,
    folderKey: "products",
  });

  assert.equal(result.skipped, true);
  assert.equal(state.destroyCalls.length, 0);
});

test("deletes legacy local files safely after an explicit replacement", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const filename = `test-cleanup-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const filePath = path.join(productsDir, filename);
  await fs.promises.writeFile(filePath, validJpeg);

  const result = await service.deleteImage({
    image: filename,
    publicId: null,
    folderKey: "products",
  });

  assert.deepEqual(result, { deleted: true, type: "local" });
  assert.equal(fs.existsSync(filePath), false);
  assert.equal(state.destroyCalls.length, 0);
});

test("refuses to delete paths outside the upload folder", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const result = await service.deleteImage({
    image: "../../.env",
    publicId: null,
    folderKey: "products",
  });

  assert.equal(result.skipped, true);
  assert.equal(service.isLegacyLocalReference("../../.env"), false);
  assert.equal(service.isLegacyLocalReference("C:\\Windows\\win.ini"), false);
  assert.equal(service.isLegacyLocalReference("https://example.com/a.jpg"), false);
});

test("treats an already-missing legacy file as cleaned up", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const result = await service.deleteImage({
    image: "does-not-exist.jpg",
    publicId: null,
    folderKey: "products",
  });

  assert.equal(result.deleted, false);
  assert.equal(result.reason, "not_found");
});

test("safeDeleteImage logs deletion failures without throwing", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  const errors = [];
  t.mock.method(console, "error", (...args) => errors.push(args));
  state.destroyError = new Error("provider unavailable");

  const result = await service.safeDeleteImage(
    { publicId: "pos/products/old", folderKey: "products" },
    "unit test cleanup",
  );

  assert.equal(result.deleted, false);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][0], "[image-storage] cleanup failed");
  assert.equal(errors[0][1].publicId, "pos/products/old");
});

test("resolves stored references without changing local filenames", (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  assert.equal(
    service.resolveImageUrl({ image: "image-123.jpg" }),
    "image-123.jpg",
  );
  assert.equal(
    service.resolveImageUrl({ image: "https://res.cloudinary.com/demo/a.jpg" }),
    "https://res.cloudinary.com/demo/a.jpg",
  );
  assert.equal(
    service.resolveImageUrl({ publicId: "pos/products/a" }),
    "https://res.cloudinary.com/demo/pos/products/a",
  );
  assert.equal(service.resolveImageUrl(null), null);
});
