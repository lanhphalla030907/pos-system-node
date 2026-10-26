const path = require("path");

const replaceModule = (absolutePath, exports) => {
  const resolved = require.resolve(absolutePath);
  const previous = require.cache[resolved];

  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports,
    children: [],
    paths: [],
  };

  return () => {
    if (previous) {
      require.cache[resolved] = previous;
    } else {
      delete require.cache[resolved];
    }
  };
};

const freshRequire = (absolutePath) => {
  const resolved = require.resolve(absolutePath);
  delete require.cache[resolved];
  return require(resolved);
};

const clearRequire = (absolutePath) => {
  delete require.cache[require.resolve(absolutePath)];
};

const apiRoot = path.join(__dirname, "../..");
const srcPath = (...parts) => path.join(apiRoot, "src", ...parts);

const validPng = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00,
  0x1f, 0x15, 0xc4, 0x89,
]);

const validJpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

const imageFile = (buffer = validJpeg, mimetype = "image/jpeg") => ({
  fieldname: "image",
  originalname: "client-supplied-name.exe",
  encoding: "7bit",
  mimetype,
  buffer,
  size: buffer.length,
});

module.exports = {
  apiRoot,
  srcPath,
  replaceModule,
  freshRequire,
  clearRequire,
  validPng,
  validJpeg,
  imageFile,
};
