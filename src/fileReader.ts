export function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) throw new Error("something unexpected happened");
      if (!(e.target.result instanceof ArrayBuffer))
        throw new Error("failed to decode the file");
      resolve(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  });
}
