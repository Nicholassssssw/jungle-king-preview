// Shared ZIP codec: no photos or model files leave the browser.
const MAX_BYTES = 50 * 1024 * 1024;
export async function encodeModelArchive(JSZip, artifacts, metadata) {
  const zip = new JSZip();
  zip.file('model.json', JSON.stringify({modelTopology:artifacts.modelTopology, weightsManifest:[{paths:['weights.bin'],weights:artifacts.weightSpecs}], format:'layers-model', generatedBy:'Jungle King browser training demo'}));
  zip.file('weights.bin', artifacts.weightData);
  zip.file('metadata.json', JSON.stringify(metadata));
  return zip.generateAsync({type:'uint8array'});
}
export async function decodeModelArchive(JSZip, bytes) {
  const zip = await JSZip.loadAsync(bytes), files = [];
  for (const name of ['model.json','metadata.json','weights.bin']) {
    const item = zip.file(name);
    if (!item) throw new Error('ZIP must contain model.json, metadata.json and weights.bin at its top level.');
    const data = await item.async('uint8array');
    if (data.byteLength > MAX_BYTES) throw new Error('The exported model is too large for this demo.');
    files.push({name,data});
  }
  return files;
}
