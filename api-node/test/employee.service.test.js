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

const servicePath = path.join(apiRoot, "src/services/employee.service.js");
const repoPath = path.join(apiRoot, "src/repositories/employee.repository.js");
const helperPath = path.join(apiRoot, "src/util/helper.js");
const authPath = path.join(apiRoot, "src/services/auth.service.js");
const storagePath = path.join(
  apiRoot,
  "src/services/storage/image-storage.service.js",
);

const employeeData = {
  name: "Test Employee",
  gender: "Male",
  dob: "1990-01-01",
  phone: "012345678",
  email: "employee@example.com",
  address: "Address",
  role_id: 1,
  salary: "500",
  hire_date: "2024-01-01",
  status: 1,
  create_by: 1,
};

const setup = () => {
  const state = {
    events: [],
    uploadError: null,
    createError: null,
    updateError: null,
    removeError: null,
    existing: null,
    safeDeleteCalls: [],
    createArgs: null,
    updateArgs: null,
    dbQueries: [],
  };

  const repository = {
    async create(data) {
      state.events.push("db.create");
      state.createArgs = data;
      if (state.createError) throw state.createError;
      return 9;
    },
    async update(id, data) {
      state.events.push("db.update");
      state.updateArgs = { id, data };
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
    async getAll() {
      return [];
    },
    async updateStatus() {
      return 1;
    },
    async checkUserAccount() {
      return null;
    },
    async assignUser() {
      return 1;
    },
  };

  const helper = {
    db: {
      async query(sql) {
        state.dbQueries.push(sql);
        if (sql.includes("FROM role")) return [[{ id: 1 }]];
        if (sql.includes("MAX(id)")) return [[{ id: 4 }]];
        return [[]];
      },
    },
  };

  const authService = {
    async register() {
      return { id: 1 };
    },
  };

  const storage = {
    async uploadImage(file, folderKey) {
      state.events.push("storage.upload");
      if (state.uploadError) throw state.uploadError;
      return {
        image: "https://res.cloudinary.com/demo/image/upload/pos/employee/new.jpg",
        publicId: "pos/employee/new",
        folderKey,
      };
    },
    async safeDeleteImage(reference, context) {
      state.events.push("storage.delete");
      state.safeDeleteCalls.push({ reference, context });
      return { deleted: true };
    },
  };

  const restores = [
    replaceModule(repoPath, repository),
    replaceModule(helperPath, helper),
    replaceModule(authPath, authService),
    replaceModule(storagePath, storage),
  ];
  const service = freshRequire(servicePath);

  const cleanup = () => {
    clearRequire(servicePath);
    restores.reverse().forEach((restore) => restore());
  };

  return { service, state, cleanup };
};

test("create uploads a photo to the employee folder and persists its identifiers", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.create({ ...employeeData }, imageFile());

  assert.equal(result.id, 9);
  assert.equal(result.code, "EMP-000005");
  assert.equal(
    state.createArgs.image,
    "https://res.cloudinary.com/demo/image/upload/pos/employee/new.jpg",
  );
  assert.equal(state.createArgs.image_public_id, "pos/employee/new");
  assert.deepEqual(state.events, ["storage.upload", "db.create"]);
});

test("create without a photo stores null references", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  await service.create({ ...employeeData });

  assert.equal(state.createArgs.image, null);
  assert.equal(state.createArgs.image_public_id, null);
});

test("create cleans up the upload when the database insert fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.createError = new Error("db insert failed");

  await assert.rejects(
    () => service.create({ ...employeeData }, imageFile()),
    /db insert failed/,
  );

  assert.equal(state.safeDeleteCalls.length, 1);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/employee/new");
});

test("update replaces the photo only after the database update succeeds", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 2,
    image: "https://res.cloudinary.com/demo/image/upload/pos/employee/old.jpg",
    image_public_id: "pos/employee/old",
  };

  await service.update(2, { ...employeeData }, imageFile());

  assert.deepEqual(state.events, [
    "storage.upload",
    "db.update",
    "storage.delete",
  ]);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/employee/old");
});

test("update without a photo preserves the existing photo", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 2,
    image: "legacy-employee.jpg",
    image_public_id: null,
  };

  await service.update(2, { ...employeeData });

  assert.equal(state.updateArgs.data.image, "legacy-employee.jpg");
  assert.equal(state.updateArgs.data.image_public_id, null);
  assert.equal(state.safeDeleteCalls.length, 0);
});

test("update cleans up the new upload and keeps the old photo on database failure", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 2,
    image: "https://res.cloudinary.com/demo/image/upload/pos/employee/old.jpg",
    image_public_id: "pos/employee/old",
  };
  state.updateError = new Error("db update failed");

  await assert.rejects(
    () => service.update(2, { ...employeeData }, imageFile()),
    /db update failed/,
  );

  assert.equal(state.safeDeleteCalls.length, 1);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/employee/new");
});

test("remove deletes the database row first, then the image", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = {
    id: 2,
    image: "https://res.cloudinary.com/demo/image/upload/pos/employee/old.jpg",
    image_public_id: "pos/employee/old",
  };

  await service.remove(2);

  assert.deepEqual(state.events, ["db.remove", "storage.delete"]);
  assert.equal(state.safeDeleteCalls[0].reference.publicId, "pos/employee/old");
});

test("remove leaves the image alone when the database delete fails", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 2, image: "legacy-employee.jpg", image_public_id: null };
  state.removeError = new Error("constraint");

  await assert.rejects(() => service.remove(2), /constraint/);
  assert.equal(state.safeDeleteCalls.length, 0);
});

test("update upload failure never reaches the database", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.existing = { id: 2, image: "old.jpg", image_public_id: null };
  state.uploadError = Object.assign(new Error("storage down"), {
    statusCode: 502,
  });

  await assert.rejects(
    () => service.update(2, { ...employeeData }, imageFile()),
    /storage down/,
  );
  assert.equal(state.events.includes("db.update"), false);
});
