import { processUrlToExcel } from "../services/file.services.js";
import { validateFileRequest } from "../validators/file.validator.js";
import logger from "../utils/logger.js";

export const processFile = async (req, res, next) => {
  try {
    const { fileUrl } = validateFileRequest(req.body);
    const result = await processUrlToExcel(fileUrl);
    res.json({
      success: true,
      message: "File processed successfully",
      data: result,
    });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
};
