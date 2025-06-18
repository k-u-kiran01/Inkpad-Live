import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middlewares/error";
import Document from "../../db/models/Document";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { marked } from "marked";

export const exportDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const docId = req.params.id;
    const formatType = req.params.format;

    const doc = await Document.findOne({ docId });
    if (!doc) {
      const error: CustomError = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    const fileNameBase = `${doc.title.replace(/\s+/g, "_")}_${Date.now()}`;

    const supportedFormats = ["pdf", "md"];

    if (!supportedFormats.includes(formatType)) {
      const error: CustomError = new Error("Invalid format");
      error.statusCode = 400;
      throw error;
    }

    if (formatType === "md") {
      const exportDir = path.join(__dirname, "../../../exports");
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      const fixedString = doc.content.replace(/\\n/g, "\n");

      const filePath = path.join(exportDir, `${fileNameBase}.md`);
      fs.writeFileSync(filePath, fixedString, "utf-8");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileNameBase}.md"`
      );
      res.setHeader("Content-Type", "text/markdown");

      return res.download(filePath, (err) => {
        if (!err) fs.unlink(filePath, () => {});
        else next(err);
      });
    }

    if (formatType === "pdf") {
      const fixedString = doc.content.replace(/\\n/g, "\n");
      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
              pre { background: #f4f4f4; padding: 12px; border-left: 4px solid #ccc; }
              code { background-color: #f9f9f9; padding: 2px 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${doc.title}</h1>
            ${marked(fixedString)}
          </body>
        </html>
      `;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileNameBase}.pdf"`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.write(pdfBuffer);
      res.end();
    }
  } catch (err) {
    next(err);
  }
};
