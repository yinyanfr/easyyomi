// pdf-poppler.d.ts
declare module 'pdf-poppler' {
  interface Options {
    format: 'jpeg' | 'png';
    out_dir: string;
    out_prefix: string;
    page: number | null;
  }

  function convert(filePath: string, opts: Options): Promise<string[]>;

  export = {
    convert,
    Options,
  };
}
