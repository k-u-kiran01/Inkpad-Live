import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middlewares/error";
import Document from "../../db/models/Document";
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

    const fixedString = doc.content.replace(/\\n/g, "\n");

    // ✅ Markdown export - stream buffer directly
    if (formatType === "md") {
      const buffer = Buffer.from(fixedString, "utf-8");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileNameBase}.md"`
      );
      res.setHeader("Content-Type", "text/markdown");
      return res.send(buffer);
    }

    // ✅ PDF export - use puppeteer with Railway-safe launch config
    if (formatType === "pdf") {
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

      const browser = await puppeteer.launch({
        headless: true, // or true if using puppeteer < 21
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileNameBase}.pdf"`
      );
      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfBuffer);
    }
  } catch (err) {
    console.error("💥 Export Error:", err);
    next(err);
  }
};
