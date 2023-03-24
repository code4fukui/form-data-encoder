# form-data-encoder

Encode `FormData` content into the `multipart/form-data` format

[![Code Coverage](https://codecov.io/github/octet-stream/form-data-encoder/coverage.svg?branch=master)](https://codecov.io/github/octet-stream/form-data-encoder?branch=master)
[![CI](https://github.com/octet-stream/form-data-encoder/workflows/CI/badge.svg)](https://github.com/octet-stream/form-data-encoder/actions/workflows/ci.yml)
[![ESLint](https://github.com/octet-stream/form-data-encoder/workflows/ESLint/badge.svg)](https://github.com/octet-stream/form-data-encoder/actions/workflows/eslint.yml)

## Requirements

- browsers or Deno

## Usage

```javascript
import { FormDataEncoder } from "https://code4fukui.github.io/form-data-encoder/FormDataEncoder.js";

const form = new FormData();
form.set("a", 15);
form.set("b", "test");
form.set("file", new Blob([new Uint8Array([1, 2, 3])]), "a.txt");

const { headers, body } = await FormDataEncoder.encode(form);
console.log(headers, new TextDecoder().decode(body));
```

## Build

```sh
npm run build
```

## API

### `class FormDataEncoder`

##### `constructor(form[, boundary, options]) -> {FormDataEncoder}`

  - **{FormDataLike}** form - FormData object to encode. This object must be a spec-compatible FormData implementation.
  - **{string}** [boundary] - An optional boundary string that will be used by the encoder. If there's no boundary string is present, FormDataEncoder will generate it automatically.
  - **{object}** [options] - FormDataEncoder options.
  - **{boolean}** [options.enableAdditionalHeaders = false] - When enabled, the encoder will emit additional per part headers, such as `Content-Length`. Please note that the web clients do not include these, so when enabled this option might cause an error if `multipart/form-data` does not consider additional headers.

Creates a `multipart/form-data` encoder.

#### Instance properties

##### `boundary -> {string}`

Returns boundary string.

##### `contentType -> {string}`

Returns Content-Type header.

##### `contentLength -> {string}`

Return Content-Length header.

##### `headers -> {object}`

Returns headers object with Content-Type and Content-Length header.

#### Instance methods

##### `values() -> {Generator<Uint8Array | FileLike, void, undefined>}`

Creates an iterator allowing to go through form-data parts (with metadata).
This method **will not** read the files.

##### `encode() -> {AsyncGenerator<Uint8Array, void, undefined>}`

Creates an async iterator allowing to perform the encoding by portions.
This method **will** also read files.

##### `[Symbol.iterator]() -> {Generator<Uint8Array | FileLike, void, undefined>}`

An alias for `Encoder#values()` method.

##### `[Symbol.asyncIterator]() -> {AsyncGenerator<Uint8Array, void, undefined>}`

An alias for `Encoder#encode()` method.

### `isFile(value) -> {boolean}`

Check if a value is File-ish object.

  - **{unknown}** value - a value to test

### `isFormData(value) -> {boolean}`

Check if a value is FormData-ish object.

  - **{unknown}** value - a value to test
