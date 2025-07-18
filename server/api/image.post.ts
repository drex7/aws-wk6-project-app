import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { prisma } from "~/lib/db";
import { getS3Client } from "~/lib/s3Config";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event);
    const formData = await readMultipartFormData(event);
    console.log("formData -> ", formData);
    const s3Client = getS3Client(config);

    const responseBody = {
      message: "",
      statusCode: 0,
    };

    let fileData;
    let description = "";

    if (!formData) {
      responseBody.statusCode = 400;
      responseBody.message = "No form data provided";
      return responseBody;
    }

    for (const part of formData) {
      if (part.name === "file") {
        fileData = part;
      } else if (part.name === "description") {
        // h3's readMultipartFormData returns values as Uint8Array
        description = new TextDecoder().decode(part.data);
      }
    }

    if (!fileData) {
      throw new Error("No file uploaded.");
    }

    const originalFilename = fileData.filename ?? "uploaded_file";
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `images/${Date.now()}-${sanitizedFilename}`;
    const contentType = fileData.type;
    const fileSize = fileData.data.length;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileData.data,
      ContentType: contentType,
      ContentLength: fileSize,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
    } catch (s3Error) {
      console.error("Error uploading to S3:", s3Error);
      throw new Error("Failed to upload file to S3.");
    }

    // Save metadata to the database
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    try {
      const newImageMetaData = await prisma.image.create({
        data: {
          key,
          url,
          filename: sanitizedFilename,
          description: description,
        },
      });
      return {
        message: "File uploaded successfully!",
        data: newImageMetaData,
      };
    } catch (dbError) {
      console.error("Error saving metadata to DB:", dbError);
      // If DB save fails, delete the file from S3 to prevent orphaned files.
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
      );
      throw new Error("Failed to save file metadata to the database.");
    }
  } catch (error) {
    console.error("Server upload error:", error);
    // h3 automatically handles error responses for thrown errors
    // You can customize the error response with setResponseStatus
    event.node.res.statusCode = 500;
    return {
      error: (error instanceof Error ? error.message : "An unknown error occurred during upload."),
    };
  } finally {
    // Disconnect Prisma client if using it
    await prisma.$disconnect();
  }
});
