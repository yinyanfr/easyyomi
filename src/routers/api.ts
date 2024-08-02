import { Router } from 'express';
import { getChapterPages, getChapters, getMangaSeries, getPage } from '../lib';
import { join } from 'node:path';

const local = join(__dirname, '../../local');

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
    res.json(pages);
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
    const page = await getPage(join(local, seriesName, chapterName), pageName);
    res.send(page);
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
});

export default app;
