import { FormDataEncoder } from "./FormDataEncoder.js";

const form = new FormData();
form.set("a", 2);
form.set("b", 20);
//form.set("file", file, "a.txt");
//form.set("file", new Blob(["abc"]), "a.txt");
form.set("file", new Blob([new Uint8Array([1, 2, 3])]), "a.txt");

const { headers, body } = await FormDataEncoder.encode(form);
console.log(headers, new TextDecoder().decode(body));
