import fs from "fs";
import path, { extname } from "path";
import axios from "axios";
import zlib from "zlib";
import { promisify } from "util";
import { pipeline } from "stream";
import decompress from "decompress";
import ExcelJS from "exceljs";
import { parse } from "csv-parse/sync";
import logger from "../utils/logger.js";

const pipe = promisify(pipeline);

// 📥 Step 1: Download file
export async function downloadFile(url, destDir = "tmp") {
  await fs.promises.mkdir(destDir, { recursive: true });
  const filename = path.basename(url);
  const dest = path.join(destDir, filename);

  logger.info(`⬇️ Downloading file: ${url}`);
  const response = await axios({ url, responseType: "stream" });
  await pipe(response.data, fs.createWriteStream(dest));
  logger.info(`✅ Downloaded: ${dest}`);
  return dest;
}

// 📦 Step 2: Extract archive or gzip
export async function extractFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  logger.info(`📦 Extracting file: ${filePath}`);

  if (ext === ".gz") {
    // Check magic bytes
    const firstBytes = Buffer.alloc(2);
    const fd = await fs.promises.open(filePath, "r");
    await fd.read(firstBytes, 0, 2, 0);
    await fd.close();

    const isGzip = firstBytes[0] === 0x1f && firstBytes[1] === 0x8b;
    if (!isGzip) {
      logger.warn("⚠️ File has .gz extension but is plain text. Skipping gunzip.");
      return filePath;
    }

    const outPath = filePath.replace(/\.gz$/, ".txt");
    await pipe(
      fs.createReadStream(filePath),
      zlib.createGunzip(),
      fs.createWriteStream(outPath)
    );
    return outPath;
  }

  if ([".zip", ".7z"].includes(ext)) {
    const outDir = path.dirname(filePath);
    const files = await decompress(filePath, outDir);
    if (!files.length) throw new Error("No files extracted from archive");
    return files[0].path;
  }

  return filePath; // Already usable
}

// 📝 Step 3: Parse CSV/TSV into JSON
export async function parseData(filePath) {
  logger.info(`📖 Parsing file: ${filePath}`);
  const raw = await fs.promises.readFile(filePath, "utf8");

  // Detect delimiter: if tabs are more frequent than commas → TSV
  const delimiter = (raw.match(/\t/g) || []).length > (raw.match(/,/g) || []).length ? "\t" : ",";

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    delimiter,
  });

  logger.info(`✅ Parsed ${records.length} rows`);
  return records;
}

// 📊 Step 4: Convert to Excel
export async function writeExcel(records, filename = "output.xlsx") {
  if (!records.length) throw new Error("No data to write to Excel");

  // Ensure output folder exists
  const outputDir = path.join(process.cwd(), "output");
  await fs.promises.mkdir(outputDir, { recursive: true });

  const outPath = path.join(outputDir, filename);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  // Add header
  sheet.columns = Object.keys(records[0]).map((key) => ({ header: key, key }));

  // Add rows
  records.forEach((row) => sheet.addRow(row));

  await workbook.xlsx.writeFile(outPath);
  logger.info(`📊 Excel saved: ${outPath}`);
  return outPath;
}

// 🚀 Step 5: Orchestrator
export async function processUrlToExcel(url) {
  const downloaded = await downloadFile(url);
  const extracted = await extractFile(downloaded);
  const records = await parseData(extracted);

  // ✅ Save to output folder instead of tmp
  const excelPath = await writeExcel(records, "report.xlsx");

  return excelPath;
}
