import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import AdmZip from 'adm-zip';
import {
  createExtractorFromData,
  createExtractorFromFile,
} from 'node-unrar-js';
// import { PDFDocument } from 'pdf-lib';
// import pdfPoppler from 'pdf-poppler';

/**
 * Asynchronously fetches manga series from a local directory path that contains manga series in folders.
 * Each manga series is represented by a folder in the given directory.
 *
 * @param {string} localPath - The path to the directory containing the manga series folders.
 *
 * @returns {Promise<Array<{name: string, lastModified: Date}>>} A promise that resolves to an array of objects.
 * Each object represents a manga series and contains two properties:
 * - `name`: The name of the manga series, which is the name of the corresponding folder.
 * - `lastModified`: The date when the corresponding folder was last modified.
 *
 * @example
 *
 * getMangaSeries('/path/to/manga/directory').then(series => {
 *   console.log(series);
 *   // Output: [{ name: 'One Piece', lastModified: 2022-01-01T00:00:00.000Z }, ...]
 * });
 *
 * @async
 */
export async function getMangaSeries(localPath: string) {
  const directories = await readdir(localPath);
  const series = [];

  for (const directory of directories) {
    const directoryPath = join(localPath, directory);
    const stats = await stat(directoryPath);

    if (stats.isDirectory()) {
      series.push({
        name: directory,
        lastModified: stats.mtime,
      });
    }
  }

  return series;
}

/**
 * Asynchronously fetches the names and last modified times of all chapters in a manga series.
 * The series can be a directory containing chapter files or directories.
 *
 * @param {string} seriePath - The path to the series directory.
 *
 * @returns {Promise<Array<{name: string, lastModified: Date}>>} A promise that resolves to an array of chapter objects.
 * Each chapter object has the following properties:
 * - `name`: The name of the chapter, which is the name of the corresponding file or folder.
 * - `lastModified`: The date when the corresponding file or folder was last modified.
 *
 * @example
 *
 * getChapters('/path/to/series').then(chapters => {
 *   console.log(chapters);
 *   // Output: [{ name: 'chapter1', lastModified: 2022-01-01T00:00:00.000Z }, ...]
 * });
 *
 * @async
 */
export async function getChapters(seriePath: string) {
  const files = await readdir(seriePath);
  const chapters = [];

  for (const file of files) {
    const filePath = join(seriePath, file);
    const stats = await stat(filePath);

    const chapter = {
      name: file,
      lastModified: stats.mtime,
    };

    chapters.push(chapter);
  }

  return chapters;
}

/**
 * Asynchronously fetches identifiers of all images from a manga chapter.
 * The chapter can be a zip/cbz, rar/cbr, or pdf file, or a directory containing image files.
 *
 * @param {string} chapterPath - The path to the chapter file or directory.
 *
 * @returns {Promise<Array<string>>} A promise that resolves to an array of identifiers.
 * Each identifier is a string representing the filename (for folders and zip/rar archives) or the page number (for pdf files).
 *
 * @example
 *
 * getChapterPages('/path/to/chapter.zip').then(identifiers => {
 *   console.log(identifiers);
 *   // Output: ['image1.jpg', 'image2.jpg', ...]
 * });
 *
 * @async
 */
export async function getChapterPages(chapterPath: string) {
  const stats = await stat(chapterPath);
  const extension = extname(chapterPath);

  let identifiers;

  if (stats.isDirectory()) {
    const files = await readdir(chapterPath);
    identifiers = files;
  } else if (extension === '.zip' || extension === '.cbz') {
    const zip = new AdmZip(chapterPath);
    const zipEntries = zip.getEntries();
    identifiers = zipEntries.map(entry => entry.entryName);
  } else if (extension === '.rar' || extension === '.cbr') {
    const extractor = await createExtractorFromFile({ filepath: chapterPath });
    const entries = extractor.getFileList();
    identifiers = Array.from(entries.fileHeaders).map(file => file.name);
    // } else if (extension === '.pdf') {
    //   const dataBuffer = await readFile(chapterPath);
    //   const data = await PDFDocument.load(dataBuffer);
    //   const pages = data.getPages();
    //   identifiers = pages.map((_, index) => `${index}`);
  } else {
    throw new Error('Unsupported chapter format');
  }

  return identifiers;
}

/**
 * Asynchronously fetches an image from a manga chapter.
 * The chapter can be a zip/cbz, rar/cbr, or pdf file, or a directory containing image files.
 *
 * @param {string} chapterPath - The path to the chapter file or directory.
 * @param {string} identifier - The identifier of the image to fetch.
 *
 * @returns {Promise<Buffer>} A promise that resolves to a buffer containing the image data.
 *
 * @example
 *
 * getPage('/path/to/chapter.zip', 'image1.jpg').then(image => {
 *   console.log(image);
 *   // Output: <Buffer ...>
 * });
 *
 * @async
 */
export async function getPage(chapterPath: string, identifier: string) {
  const stats = await stat(chapterPath);
  const extension = extname(chapterPath);

  let image;

  if (stats.isDirectory()) {
    const imagePath = join(chapterPath, identifier);
    image = await readFile(imagePath);
  } else if (extension === '.zip' || extension === '.cbz') {
    const zip = new AdmZip(chapterPath);
    const zipEntry = zip.getEntry(identifier);
    image = zipEntry?.getData();
  } else if (extension === '.rar' || extension === '.cbr') {
    const buffer = await readFile(chapterPath);
    const extractor = await createExtractorFromData({ data: buffer });
    const extracted = extractor.extract({ files: [identifier] });
    image = Buffer.from(Array.from(extracted.files)[0].extraction ?? []);
    // } else if (extension === '.pdf') {
    //   const out_dir = join(__dirname, '../../tmp', basename(chapterPath));
    //   const opts = (pdfPoppler.Options = {
    //     format: 'jpeg' as const,
    //     out_dir,
    //     out_prefix: '',
    //     page: parseInt(identifier),
    //   });
    //   pdfPoppler.convert(chapterPath, opts);
    //   const image = await readFile(join(out_dir, `${identifier}.jpg`));
    //   return image;
  } else {
    throw new Error('Unsupported chapter format');
  }

  return image;
}
