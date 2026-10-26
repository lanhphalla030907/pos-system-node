const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const jwt = require("jsonwebtoken");
const {
  apiRoot,
  clearRequire,
  freshRequire,
  replaceModule,
} = require("./helpers/test-utils");

process.env.JWT_SECRET = "test-only-jwt-secret";

const permissionPath = path.join(apiRoot, "src/middleware/checkPermission.js");
const permissionRepoPath = path.join(
  apiRoot,
  "src/repositories/rolePermission.repository.js",
);

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const setupPermission = () => {
  const state = { permissions: [], error: null };
  const repository = {
    async getUserPermissions() {
      if (state.error) throw state.error;
      return state.permissions;
    },
  };
  const restore = replaceModule(permissionRepoPath, repository);
  const { checkPermission } = freshRequire(permissionPath);

  return {
    checkPermission,
    state,
    cleanup() {
      clearRequire(permissionPath);
      restore();
    },
  };
};

test("upload authorization rejects a request without a user", async (t) => {
  const { checkPermission, cleanup } = setupPermission();
  t.after(cleanup);

  const req = {};
  const res = makeResponse();
  let nextCalled = false;

  await checkPermission("product.delete")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { success: false, message: "Unauthorized" });
});

test("upload authorization rejects a user without the required permission", async (t) => {
  const { checkPermission, cleanup } = setupPermission();
  t.after(cleanup);

  const req = { user: { data: { id: 5 } } };
  const res = makeResponse();
  let nextCalled = false;

  await checkPermission("employee.update")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: "You don't have permission",
  });
});

test("upload authorization allows a user with the required permission", async (t) => {
  const { checkPermission, state, cleanup } = setupPermission();
  t.after(cleanup);
  state.permissions = [{ code: "employee.update" }];

  const req = { user: { data: { id: 5 } } };
  const res = makeResponse();
  let nextCalled = false;

  await checkPermission("employee.update")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("permission lookup failures return a safe 500 response", async (t) => {
  const { checkPermission, state, cleanup } = setupPermission();
  t.after(cleanup);
  state.error = new Error("db unavailable");

  const req = { user: { data: { id: 5 } } };
  const res = makeResponse();

  await checkPermission("employee.update")(req, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "db unavailable");
});

test("token validation rejects a missing bearer token", async (t) => {
  const authPath = path.join(apiRoot, "src/services/auth.service.js");
  const controllerPath = path.join(apiRoot, "src/controller/auth.controller.js");
  t.after(() => {
    clearRequire(controllerPath);
    clearRequire(authPath);
  });

  const { validate_token } = freshRequire(controllerPath);
  const res = makeResponse();

  await validate_token()({ headers: {} }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Unauthorized");
});

test("token validation accepts a valid signed token and populates request context", async (t) => {
  const authPath = path.join(apiRoot, "src/services/auth.service.js");
  const controllerPath = path.join(apiRoot, "src/controller/auth.controller.js");
  t.after(() => {
    clearRequire(controllerPath);
    clearRequire(authPath);
  });

  const { validate_token } = freshRequire(controllerPath);
  const token = jwt.sign(
    { data: { id: 11, name: "Cashier", username: "cashier" } },
    process.env.JWT_SECRET,
  );
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = makeResponse();

  await new Promise((resolve) => {
    validate_token()(req, res, resolve);
  });

  assert.equal(req.current_id, 11);
  assert.equal(req.current_name, "Cashier");
  assert.equal(req.current_username, "cashier");
});
