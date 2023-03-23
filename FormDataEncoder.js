import { FormDataEncoder as Encoder } from "./lib/FormDataEncoder.js";

const encode = async (form) => { // { headers, body }
  const encoder = new Encoder(form);
  const data = encoder.encode();
  const list = [];
  let len = 0;
  for await (const val of data) {
    list.push(val);
    len += val.length;
  }
  const res = new Uint8Array(len);
  let idx = 0;
  for (const d of list) {
    for (let i = 0; i < d.length; i++) {
      res[idx++] = d[i];
    }
  }
  return { headers: encoder.headers, body: res };
};

export const FormDataEncoder = { encode };

