const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const {
  clearRequire,
  freshRequire,
  replaceModule,
} = require("./helpers/test-utils");

const apiRoot = path.join(__dirname, "..");
const servicePath = path.join(
  apiRoot,
  "src/services/storage/cloudinary.service.js",
);
const cloudinaryPath = require.resolve("cloudinary", { paths: [apiRoot] });

const ENV_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const setup = (overrides = {}) => {
  const state = {
    configCalls: [],
    uploadOptions: null,
    uploadBuffer: null,
    destroyCalls: [],
    uploadError: null,
    uploadResult: null,
    destroyResult: { result: "ok" },
    destroyError: null,
    urlCalls: [],
  };

  const uploader = {
    upload_stream(options, callback) {
      state.uploadOptions = options;
      return {
        on() {
          return this;
        },
        end(buffer) {
          state.uploadBuffer = buffer;
          setImmediate(() => {
            if (state.uploadError) {
              callback(state.uploadError);
              return;
            }
            const result =
              state.uploadResult ||
              {
                secure_url: `https://res.cloudinary.com/demo/image/upload/${options.folder}/${options.public_id}.jpg`,
                public_id: `${options.folder}/${options.public_id}`,
                width: 10,
                height: 10,
                format: "jpg",
              };
            callback(null, result);
          });
        },
      };
    },
    async destroy(publicId, options) {
      state.destroyCalls.push({ publicId, options });
      if (state.destroyError) throw state.destroyError;
      return state.destroyResult;
    },
  };

  const v2 = {
    config(config) {
      state.configCalls.push(config);
    },
    uploader,
    url(publicId, options) {
      state.urlCalls.push({ publicId, options });
      return `https://res.cloudinary.com/demo/image/upload/${publicId}`;
    },
  };

  const fakeSdk = { v2, ...overrides };
  const restoreSdk = replaceModule(cloudinaryPath, fakeSdk);
  const service = freshRequire(servicePath);

  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "api-key";
  process.env.CLOUDINARY_API_SECRET = "super-secret";

  const cleanup = () => {
    clearRequire(servicePath);
    restoreSdk();
    ENV_KEYS.forEach((key) => delete process.env[key]);
  };

  return { service, state, cleanup };
};

test("uploads a buffer with a server-generated public_id and folder", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.uploadBuffer(Buffer.from("image-bytes"), {
    folder: "pos/products",
    mimetype: "image/jpeg",
  });

  assert.equal(state.configCalls.length, 1);
  assert.deepEqual(state.configCalls[0], {
    cloud_name: "demo",
    api_key: "api-key",
    api_secret: "super-secret",
    secure: true,
  });
  assert.equal(state.uploadOptions.folder, "pos/products");
  assert.match(
    state.uploadOptions.public_id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.equal(state.uploadOptions.use_filename, false);
  assert.equal(state.uploadOptions.overwrite, false);
  assert.deepEqual(state.uploadOptions.allowed_formats, ["jpg", "jpeg", "png"]);
  assert.equal(
    result.publicId,
    `pos/products/${state.uploadOptions.public_id}`,
  );
  assert.match(result.url, /^https:\/\/res\.cloudinary\.com\//);
});

test("fails clearly when Cloudinary credentials are missing", async (t) => {
  const { service, cleanup } = setup();
  t.after(cleanup);
  delete process.env.CLOUDINARY_API_SECRET;

  await assert.rejects(
    async () =>
      service.uploadBuffer(Buffer.from("image-bytes"), {
        folder: "pos/products",
      }),
    (error) => {
      assert.equal(error.statusCode, 503);
      assert.match(error.message, /not configured/);
      assert.match(error.message, /CLOUDINARY_API_SECRET/);
      assert.doesNotMatch(error.message, /super-secret/);
      return true;
    },
  );
});

test("maps provider upload failures to a safe 502 error", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.uploadError = new Error("provider said no");
  state.uploadError.http_code = 401;

  await assert.rejects(
    async () =>
      service.uploadBuffer(Buffer.from("image-bytes"), {
        folder: "pos/products",
      }),
    (error) => {
      assert.equal(error.statusCode, 502);
      assert.match(error.message, /Image upload failed/);
      assert.doesNotMatch(error.message, /provider said no/);
      assert.doesNotMatch(error.message, /super-secret/);
      return true;
    },
  );
});

test("rejects an empty upload buffer before calling Cloudinary", (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  assert.throws(
    () => service.uploadBuffer(Buffer.alloc(0), { folder: "pos/products" }),
    { statusCode: 400, message: "Uploaded image is empty" },
  );
  assert.equal(state.uploadOptions, null);
});

test("destroys assets by public_id", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const result = await service.destroy("pos/products/abc");

  assert.equal(result.result, "ok");
  assert.deepEqual(state.destroyCalls[0], {
    publicId: "pos/products/abc",
    options: { resource_type: "image", invalidate: true },
  });
});

test("treats an already-missing Cloudinary asset as deleted", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.destroyResult = { result: "not found" };

  const result = await service.destroy("pos/products/missing");
  assert.equal(result.result, "not found");
});

test("rejects an unconfirmed or failed deletion", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);
  state.destroyResult = { result: "error" };

  await assert.rejects(() => service.destroy("pos/products/abc"), /confirm/);

  state.destroyResult = { result: "ok" };
  state.destroyError = new Error("network");
  await assert.rejects(() => service.destroy("pos/products/abc"), /delete failed/);
});

test("resolves a delivery URL from a public_id", async (t) => {
  const { service, state, cleanup } = setup();
  t.after(cleanup);

  const url = service.resolveUrl("pos/products/abc");

  assert.equal(state.urlCalls[0].publicId, "pos/products/abc");
  assert.equal(state.urlCalls[0].options.secure, true);
  assert.match(url, /pos\/products\/abc/);
});
