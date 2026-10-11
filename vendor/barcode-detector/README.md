Vendored for offline use (no CDN at runtime):
- barcode-detector 3.2.2 (MIT, https://github.com/Sec-ant/barcode-detector) – dist/iife/ponyfill.js
- zxing-wasm 3.1.3 (MIT, https://github.com/Sec-ant/zxing-wasm) – dist/reader/zxing_reader.wasm
  sha256 2ebda08a93eea3efcd8399cda6b276e6a0b1de4fec60b4d8988a047de4c6d1ba (= ZXING_WASM_SHA256 of the bundle)
  zxing-wasm is built from zxing-cpp (Apache-2.0, https://github.com/zxing-cpp/zxing-cpp).
Loaded only when window.BarcodeDetector is missing (iPhone/Safari, Firefox).
