import { z } from "zod";

const schema = z.object({
  fileUrl: z.string().url(),
});

export function validateFileRequest(body) {
  return schema.parse(body);
}
