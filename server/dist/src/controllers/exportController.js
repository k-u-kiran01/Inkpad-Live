"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDoc = void 0;
const Document_1 = __importDefault(require("../../db/models/Document"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const marked_1 = require("marked");
const exportDoc = async (req, res, next) => {
    try {
        const docId = req.params.id;
        const formatType = req.params.format;
        const doc = await Document_1.default.findOne({ docId });
        if (!doc) {
            const error = new Error("Document not found");
            error.statusCode = 404;
            throw error;
        }
        const fileNameBase = `${doc.title.replace(/\s+/g, "_")}_${Date.now()}`;
        const supportedFormats = ["pdf", "md"];
        if (!supportedFormats.includes(formatType)) {
            const error = new Error("Invalid format");
            error.statusCode = 400;
            throw error;
        }
        const fixedString = doc.content.replace(/\\n/g, "\n");
        // ✅ Markdown export - stream buffer directly
        if (formatType === "md") {
            const buffer = Buffer.from(fixedString, "utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${fileNameBase}.md"`);
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
            ${(0, marked_1.marked)(fixedString)}
          </body>
        </html>
      `;
            const browser = await puppeteer_1.default.launch({
                headless: "shell", // Use shell mode for faster PDF generation (puppeteer v22+)
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage", // Overcome limited /dev/shm in Docker/cloud
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                ],
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
            await browser.close();
            res.setHeader("Content-Disposition", `attachment; filename="${fileNameBase}.pdf"`);
            res.setHeader("Content-Type", "application/pdf");
            return res.send(pdfBuffer);
        }
    }
    catch (err) {
        console.error("💥 Export Error:", err);
        next(err);
    }
};
exports.exportDoc = exportDoc;
