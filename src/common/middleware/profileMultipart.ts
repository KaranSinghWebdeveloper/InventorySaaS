import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/httpErrors";

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");

const getBoundary = (contentType: string) => {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] ?? match?.[2] ?? null;
};

const getHeaderValue = (headers: string, name: string) => {
  const match = headers.match(new RegExp(`${name}="([^"]+)"`, "i"));
  return match?.[1] ?? null;
};

const safeExtension = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  return /^[a-z0-9.]+$/.test(ext) ? ext : "";
};

export const parseProfileMultipart = (req: Request, _res: Response, next: NextFunction) => {
  const contentType = req.headers["content-type"] ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return next();
  }

  const boundary = getBoundary(contentType);
  if (!boundary) {
    return next(new BadRequestError("Invalid multipart form data"));
  }

  const chunks: Buffer[] = [];

  req.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on("error", () => next(new BadRequestError("Unable to read multipart form data")));

  req.on("end", () => {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });

      const body = Buffer.concat(chunks).toString("binary");
      const parts = body.split(`--${boundary}`);
      const fields: Record<string, string | null> = {};

      for (const part of parts) {
        if (!part || part === "--\r\n" || part === "--") continue;

        const headerEndIndex = part.indexOf("\r\n\r\n");
        if (headerEndIndex === -1) continue;

        const rawHeaders = part.slice(0, headerEndIndex);
        const name = getHeaderValue(rawHeaders, "name");
        if (!name) continue;

        let value = part.slice(headerEndIndex + 4);
        if (value.endsWith("\r\n")) value = value.slice(0, -2);
        if (value.endsWith("--")) value = value.slice(0, -2);

        const filename = getHeaderValue(rawHeaders, "filename");
        if (filename) {
          if (!value.length) continue;

          const fileName = `${Date.now()}-${crypto.randomUUID()}${safeExtension(filename)}`;
          const relativePath = path.posix.join("/uploads/profile-images", fileName);
          const filePath = path.join(uploadDir, fileName);

          fs.writeFileSync(filePath, Buffer.from(value, "binary"));
          fields[name] = relativePath;
          continue;
        }

        fields[name] = value === "" ? null : value;
      }

      req.body = fields;
      return next();
    } catch {
      return next(new BadRequestError("Unable to parse multipart form data"));
    }
  });
};
