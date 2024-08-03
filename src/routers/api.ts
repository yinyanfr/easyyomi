import { Router } from 'express';
import { getChapterPages, getChapters, getMangaSeries, getPage } from '../lib';
import { join } from 'node:path';
import nodejieba from 'nodejieba';
import OpenCC from 'opencc-js';
import mimetics from 'mimetics';

const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });

const local = process.env.LOCAL ?? join(__dirname, '../../local');

const app = Router();

/**
 * GET /series
 * Retrieves the list of manga series.
 * @returns {Promise<void>} A promise that resolves with the list of manga series.
 */
app.get('/series', async (_, res) => {
  try {
    const series = await getMangaSeries(local);
    res.json(series);
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

/**
 * GET /recent
 * Retrieves the list of recently modified manga series.
 * @returns {Promise<void>} A promise that resolves with the list of recently modified manga series.
 */
app.get('/recent', async (_, res) => {
  try {
    const series = await getMangaSeries(local);
    const sorted = series.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );
    res.json(sorted);
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

/**
 * GET /chapters/:seriesName
 * Retrieves the list of chapters for a specific manga series.
 * @param {string} seriesName - The name of the manga series.
 * @returns {Promise<void>} A promise that resolves with the list of chapters.
 */
app.get('/chapters/:seriesName', async (req, res) => {
  const { seriesName } = req.params;
  try {
    const chapters = await getChapters(join(local, seriesName));
    res.json(chapters);
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

/**
 * GET /pages/:seriesName/:chapterName
 * Retrieves the list of pages for a specific chapter of a manga series.
 * @param {string} seriesName - The name of the manga series.
 * @param {string} chapterName - The name of the chapter.
 * @returns {Promise<void>} A promise that resolves with the list of pages.
 */
app.get('/pages/:seriesName/:chapterName', async (req, res) => {
  const { seriesName, chapterName } = req.params;
  try {
    const pages = await getChapterPages(join(local, seriesName, chapterName));
    res.json({ pages, seriesName, chapterName });
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

/**
 * GET /page/:seriesName/:chapterName/:pageName
 * Retrieves a specific page of a manga series.
 * @param {string} seriesName - The name of the manga series.
 * @param {string} chapterName - The name of the chapter.
 * @param {string} pageName - The name of the page.
 * @returns {Promise<void>} A promise that resolves with the page data.
 */
app.get('/page/:seriesName/:chapterName/:pageName', async (req, res) => {
  const { seriesName, chapterName, pageName } = req.params;
  try {
    const buffer = await getPage(
      join(local, seriesName, chapterName),
      pageName,
    );
    if (!buffer) {
      throw new Error('Page not found');
    }
    const mimeInfo = mimetics(buffer);

    if (mimeInfo) {
      res.setHeader('Content-Type', mimeInfo.mime);
      res.send(buffer);
    } else {
      throw new Error('Invalid image');
    }
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

/**
 * GET /search/:keyword
 * Retrieves the list of manga series that contain the specified keyword in their name.
 * @param {string} keyword - The keyword to search for.
 * @returns {Promise<void>} A promise that resolves with the list of manga series.
 */
app.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  const series = await getMangaSeries(local);
  const result = series.filter(s =>
    nodejieba.cut(converter(s.name)).includes(converter(keyword)),
  );
  return res.json(result);
});

export default app;
