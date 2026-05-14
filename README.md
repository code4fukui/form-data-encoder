# form-data-encoder

Encode `FormData` content into the `multipart/form-data` format.

[
![Code Coverage](https://codecov.io/github/octet-stream/form-data-encoder/coverage.svg?branch=master)
](https://codecov.io/github/octet-stream/form-data-encoder?branch=master)
[
![CI](https://github.com/octet-stream/form-data-encoder/workflows/CI/badge.svg)
](https://github.com/octet-stream/form-data-encoder/actions/workflows/ci.yml)
[
![ESLint](https://github.com/octet-stream/form-data-encoder/workflows/ESLint/badge.svg)
](https://github.com/octet-stream/form-data-encoder/actions/workflows/eslint.yml)

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

This library implements the [`multipart/form-data` encoding algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#multipart/form-data-encoding-algorithm), allowing you to add spec-compliant `FormData` support to any HTTP client.

## Features

-   **Isomorphic:** Works in Node.js, Deno, and modern browsers.
-   **Streaming Support:** Encodes large files efficiently using Async Iterators, keeping memory usage low.
-   **Spec-Compliant:** Follows the WHATWG specification for `multipart/form-data` encoding.
-   **Lightweight:** Zero dependencies for browser and Deno usage.

## Requirements

-   Node.js `v14.17` or newer
-   Deno
-   Modern browsers with support for ES modules

## Installation

```sh
npm install form-data-encoder
```

## Usage

### Node.js

In Node.js, you can use this library with a `FormData` implementation like `formdata-node` and an HTTP client like `node-fetch`. The encoder instance is an async iterable, making it easy to stream the request body.

```javascript
import { Readable } from "stream";
import { FormData, File, fileFromPath } from "formdata-node";
import { FormDataEncoder } from "form-data-encoder";
import fetch from "node-fetch";

const form = new FormData();

form.set("field", "Just a random string");
form.set("file", new File(["Using files is amazing"], "file.txt"));
form.set("fileFromPath", await fileFromPath("path/to/a/file.txt"));

const encoder = new FormDataEncoder(form);

const response = await fetch("https://httpbin.org/post", {
  method: "POST",
  headers: encoder.headers,
  body: Readable.from(encoder)
});

console.log(await response.json());
```

### Deno / Browser

For Deno and browsers, you can import a convenience wrapper directly from a CDN. This wrapper provides a static `encode` method that returns the headers and a fully encoded `Uint8Array` body.

```javascript
import { FormDataEncoder } from "https://code4fukui.github.io/form-data-encoder/FormDataEncoder.js";

const form = new FormData();
form.set("a", 15);
form.set("b", "test");
form.set("file", new Blob([new Uint8Array([1, 2, 3])]), "a.txt");

const { headers, body } = await FormDataEncoder.encode(form);

console.log(headers);
// {
//   "Content-Type": "multipart/form-data; boundary=...",
//   "Content-Length": "..."
// }

console.log(new TextDecoder().decode(body));
// --form-data-boundary-...
// Content-Disposition: form-data; name="a"
//
// 15
// --form-data-boundary-...
// ...
```

## API

### `class FormDataEncoder`

#### `new FormDataEncoder(form[, boundary, options])`

Creates a `multipart/form-data` encoder instance.

-   `form`: **{FormDataLike}** - A spec-compatible `FormData` object to encode.
-   `boundary`: **{string}** (Optional) - A boundary string. If not provided, a random boundary is generated.
-   `options`: **{object}** (Optional) - Configuration options.
    -   `enableAdditionalHeaders`: **{boolean}** (Default: `false`) - If `true`, emits additional per-part headers like `Content-Length`. Note: Standard web clients do not include these, and some servers may reject requests with them.

#### Instance Properties

-   `encoder.boundary`: **{string}** - The boundary string used for encoding.
-   `encoder.contentType`: **{string}** - The complete `Content-Type` header value (e.g., `multipart/form-data; boundary=...`).
-   `encoder.contentLength`: **{string | undefined}** - The calculated `Content-Length` of the entire payload. It will be `undefined` if the `FormData` object contains any streams or blobs of unknown size.
-   `encoder.headers`: **{object}** - An object containing `Content-Type` and `Content-Length` headers. Keys are case-insensitive.

#### Async Iterator

The `FormDataEncoder` instance is an async iterable. You can use it directly in a `for await...of` loop to get chunks of the encoded body. This is the most memory-efficient way to handle large files.

```javascript
const encoder = new FormDataEncoder(form);

for await (const chunk of encoder) {
  // process chunk (Uint8Array)
}
```

This is an alias for the `encoder.encode()` method.

#### Instance Methods

##### `encoder.encode() -> AsyncGenerator<Uint8Array>`

Returns an async iterator that yields encoded `Uint8Array` chunks. This method reads file content as it iterates.

##### `encoder.values() -> Generator<Uint8Array | FileLike>`

Returns a synchronous iterator that yields form-data parts. It yields header chunks (`Uint8Array`) and `FileLike` objects