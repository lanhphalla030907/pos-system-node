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

const servicePath = path.join(apiRoot, "src/services/settings.service.js");
const repoPath = path.join(apiRoot, "src/repositories/settings.repository.js");
const storagePath = path.join(
  apiRoot,
  "src/services/storage/image-storage.service.js",
);

const setup = () => {
  const state = {
    settings: {
      store_name: "My Shop",
      store_phone: "012345",
      store_logo: "https://res.cloudinary.com/demo/image/upload/pos/settings/old.jpg",
      store_logo_public_id: "pos/settings/old",
    },
    updateError: null,
    uploadError: null,
    updateBatchCalls: [],
    safeDeleteCalls: [],
    uploadCalls: [],
  };

  const repository = {
    async getAll() {
      return { ...state.settings };
    },
    async getAllKeys() {
      return Object.keys(state.settings);
    },
    async updateBatch(entries, updatedBy) {
      state.updateBatchCalls.push({ entries, updatedBy });
      if (state.updateError) throw state.updateError;
      entries.forEach(({ key, value }) => {
        state.settings[key] = value;
      });
      return entries.length;
    },
  };

  const storage = {
    async uploadImage(file, folderKey) {
      state.uploadCalls.push({ file, folderKey });
      if (state.uploadError) throw state.uploadError;
      return {
        image: "https://res.cloudinary.com/demo/image/upload/pos/settings/new.jpg",
        publicId: "pos/settings/new",
      };
    },
    async safeDeleteImage(reference, context) {
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

test("getAll hides internal Cloudinary identifiers", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);

  const settings = await service.getAll();

  assert.equal(settings.store_logo, "https://res.cloudinary.com/demo/image/upload/pos/settings/old.jpg");
  assert.equal("store_logo_public_id" in settings, false);
});

test("updating non-logo settings does not delete the logo", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.update({ store_phone: "999" }, 3);

  assert.equal(state.settings.store_phone, "999");
  assert.equal(state.updateBatchCalls[0].updatedBy, 3);
  assert.equal(state.safeDeleteCalls.length, 0);
  assert.equal(result.store_logo_public_id, undefined);
});

test("removing the logo persists the change before deleting the asset", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await service.update({ store_logo: "" }, 3);

  assert.equal(state.settings.store_logo, "");
  assert.equal(state.settings.store_logo_public_id, "");
  assert.deepEqual(state.safeDeleteCalls[0].reference, {
    image: "https://res.cloudinary.com/demo/image/upload/pos/settings/old.jpg",
    publicId: "pos/settings/old",
    folderKey: "settings",
  });
  assert.equal(
    state.updateBatchCalls[0].entries.some(
      (entry) => entry.key === "store_logo_public_id",
    ),
    true,
  );
});

test("a failed settings update does not delete the old logo", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.updateError = new Error("db down");

  await assert.rejects(
    () => service.update({ store_logo: "" }, 3),
    /db down/,
  );
  assert.equal(state.safeDeleteCalls.length, 0);
});

test("rejects an update containing only internal or unknown keys", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(
    () => service.update({ store_logo_public_id: "hacked", unknown: "x" }, 3),
    { statusCode: 400, message: "No valid settings to update" },
  );
  assert.equal(state.updateBatchCalls.length, 0);
});

test("uploadLogo persists URL plus public_id and then deletes the old logo", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const url = await service.uploadLogo({
    file: imageFile(),
    current_id: 3,
  });

  assert.equal(url, "https://res.cloudinary.com/demo/image/upload/pos/settings/new.jpg");
  assert.equal(state.uploadCalls[0].folderKey, "settings");
  assert.equal(state.settings.store_logo, url);
  assert.equal(state.settings.store_logo_public_id, "pos/settings/new");
  assert.deepEqual(
    state.updateBatchCalls[0].entries.map((entry) => entry.key),
    ["store_logo", "store_logo_public_id"],
  );
  assert.equal(state.updateBatchCalls[0].updatedBy, 3);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/settings/old");
});

test("uploadLogo cleans up the new asset if persistence fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.updateError = new Error("db down");

  await assert.rejects(
    () => service.uploadLogo({ file: imageFile(), current_id: 3 }),
    /db down/,
  );

  assert.equal(state.safeDeleteCalls.length, 1);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/settings/new");
  assert.equal(
    state.safeDeleteCalls.some(
      (call) => call.reference.publicId === "pos/settings/old",
    ),
    false,
  );
});

test("uploadLogo requires a file", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await assert.rejects(() => service.uploadLogo({ current_id: 3 }), {
    statusCode: 400,
    message: "Logo image is required",
  });
  assert.equal(state.uploadCalls.length, 0);
});
