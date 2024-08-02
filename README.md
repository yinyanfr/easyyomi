# easyyomi

easyyomi is a lightweight server for your manga / comic contents

## Checklist

- [*] zip
- [*] rar
- [] pdf (given up, kind of)
- [*] api
- [*] auth
- [*] docker
- [] mihon extension
- [] opds

## API Documentation

This document provides information about the APIs used in the application.

### Get Manga Series

**Endpoint:** `/series`
**Method:** `GET`
**Description:** Retrieves the list of manga series.
**Response:** An array of objects, each representing a manga series with `name` and `lastModified` properties.

### Get Chapters

**Endpoint:** `/chapters/:seriesName`
**Method:** `GET`
**Description:** Retrieves the list of chapters for a specific manga series.
**Parameters:** `seriesName` - The name of the manga series.
**Response:** An array of objects, each representing a chapter with `name` and `lastModified` properties.

### Get Pages

**Endpoint:** `/pages/:seriesName/:chapterName`
**Method:** `GET`
**Description:** Retrieves the list of pages for a specific chapter of a manga series.
**Parameters:**

- `seriesName` - The name of the manga series.
- `chapterName` - The name of the chapter.
  **Response:** An array of strings, each representing an identifier for a page in the chapter.

### Get Page

**Endpoint:** `/page/:seriesName/:chapterName/:pageName`
**Method:** `GET`
**Description:** Retrieves a specific page of a manga series.
**Parameters:**

- `seriesName` - The name of the manga series.
- `chapterName` - The name of the chapter.
- `pageName` - The name of the page.
  **Response:** The data of the requested page.
  For more details, refer to the source code in `src/routers/api.ts`.
  **Response:** The data of the requested page.

For more details, refer to the source code in [`src/routers/api.ts`](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).
