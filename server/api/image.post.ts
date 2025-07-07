import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "~/lib/db";
import { getS3Client } from "~/lib/s3Config";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  const s3Client = getS3Client(config);

  // Validate filename and description
  if (!body.filename || typeof body.filename !== "string") {
    console.error("Invalid filename:", body.filename);
    throw createError({ statusCode: 400, message: "Filename is required" });
  }

  if (!body.description || typeof body.description !== "string") {
    console.error("Invalid description:", body.description);
    throw createError({ statusCode: 400, message: "Description is required" });
  }

  const sanitizedFilename = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `images/${Date.now()}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: "image/*",
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  // Save metadata to the database
  try {
    await prisma.image.create({
      data: {
        key,
        url,
        filename: sanitizedFilename,
        description: body.description,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
  }

  return { url, key };
});
