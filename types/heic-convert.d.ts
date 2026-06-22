declare module 'heic-convert' {
  interface Options {
    buffer: Buffer | ArrayBuffer
    format: 'JPEG' | 'PNG'
    quality?: number
  }
  function heicConvert(options: Options): Promise<ArrayBuffer>
  export = heicConvert
}
