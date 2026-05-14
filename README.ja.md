# form-data-encoder

`FormData`の内容を`multipart/form-data`形式にエンコードします。

[
![Code Coverage](https://codecov.io/github/octet-stream/form-data-encoder/coverage.svg?branch=master)
](https://codecov.io/github/octet-stream/form-data-encoder?branch=master)
[
![CI](https://github.com/octet-stream/form-data-encoder/workflows/CI/badge.svg)
](https://github.com/octet-stream/form-data-encoder/actions/workflows/ci.yml)
[
![ESLint](https://github.com/octet-stream/form-data-encoder/workflows/ESLint/badge.svg)
](https://github.com/octet-stream/form-data-encoder/actions/workflows/eslint.yml)

このライブラリは[`multipart/form-data`エンコードアルゴリズム](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#multipart/form-data-encoding-algorithm)を実装しており、任意のHTTPクライアントに仕様に準拠した`FormData`サポートを追加できます。

## 機能

-   **アイソモーフィック:** Node.js、Deno、およびモダンブラウザで動作します。
-   **ストリーミング対応:** 非同期イテレータを使用して大容量ファイルを効率的にエンコードし、メモリ使用量を低く抑えます。
-   **仕様準拠:** `multipart/form-data`エンコードのWHATWG仕様に従っています。
-   **軽量:** ブラウザおよびDenoでの使用において依存関係がありません。

## 要件

-   Node.js `v14.17` 以降
-   Deno
-   ESモジュールをサポートするモダンブラウザ

## インストール

```sh
npm install form-data-encoder
```

## 使用方法

### Node.js

Node.jsでは、`formdata-node`のような`FormData`実装と、`node-fetch`のようなHTTPクライアントを組み合わせて使用できます。エンコーダーのインスタンスは非同期イテラブルであるため、リクエストボディのストリーミングを簡単に行うことができます。

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

### Deno / ブラウザ

Denoおよびブラウザ向けには、CDNから直接便利なラッパーをインポートできます。このラッパーは静的な`encode`メソッドを提供し、ヘッダーと完全にエンコードされた`Uint8Array`のボディを返します。

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

`multipart/form-data`エンコーダーのインスタンスを作成します。

-   `form`: **{FormDataLike}** - エンコード対象となる、仕様に準拠した`FormData`オブジェクト。
-   `boundary`: **{string}** (オプション) - バウンダリ文字列。指定しない場合、ランダムなバウンダリが生成されます。
-   `options`: **{object}** (オプション) - 設定オプション。
    -   `enableAdditionalHeaders`: **{boolean}** (デフォルト: `false`) - `true`の場合、`Content-Length`などのパートごとの追加ヘッダーを出力します。注意: 標準のWebクライアントはこれらを含まないため、サーバーによってはこれらを含むリクエストを拒否する可能性があります。

#### インスタンスプロパティ

-   `encoder.boundary`: **{string}** - エンコードに使用されるバウンダリ文字列。
-   `encoder.contentType`: **{string}** - 完全な`Content-Type`ヘッダーの値（例: `multipart/form-data; boundary=...`）。
-   `encoder.contentLength`: **{string | undefined}** - 計算されたペイロード全体の`Content-Length`。`FormData`オブジェクトにストリームやサイズ不明なBlobが含まれる場合は`undefined`になります。
-   `encoder.headers`: **{object}** - `Content-Type`と`Content-Length`ヘッダーを含むオブジェクト。キーは大文字・小文字を区別しません。

#### 非同期イテレータ

`FormDataEncoder`インスタンスは非同期イテラブルです。`for await...of`ループで直接使用して、エンコードされたボディのチャンクを取得できます。これは大容量ファイルを処理する際に最もメモリ効率の良い方法です。

```javascript
const encoder = new FormDataEncoder(form);

for await (const chunk of encoder) {
  // チャンク（Uint8Array）を処理
}
```

これは`encoder.encode()`メソッドのエイリアスです。

#### インスタンスメソッド

##### `encoder.encode() -> AsyncGenerator<Uint8Array>`

エンコードされた`Uint8Array`のチャンクを生成する非同期イテレータを返します。このメソッドはイテレーション中にファイルの内容を読み取ります。

##### `encoder.values() -> Generator<Uint8Array | FileLike>`

フォームデータの各パートを生成する同期イテレータを返します。ヘッダーのチャンク（`Uint8Array`）と`FileLike`オブジェクトを生成します。
