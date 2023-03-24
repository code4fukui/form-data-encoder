import { FormDataEncoder } from "./FormDataEncoder.js";

const form = new FormData();
form.set("a", 15);
form.set("b", "test");
form.set("file", new Blob([new Uint8Array([1, 2, 3])]), "a.txt");

const { headers, body } = await FormDataEncoder.encode(form);
console.log(headers, new TextDecoder().decode(body));
