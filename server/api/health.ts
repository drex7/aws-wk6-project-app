import { prisma } from "~/lib/db";

export default defineEventHandler(async (event) => {

	const result = await prisma.$executeRaw`SELECT 1 AS health_check`;

	return {
    status: "ok",
		message: "API is healthy",
		timestamp: new Date().toISOString(),
		result: result,
	}
});