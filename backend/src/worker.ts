import IORedis from "ioredis";
import { Worker } from "bullmq";
import { readFile, rm } from "fs/promises";
import { PDFParse } from "pdf-parse";
const connection = new IORedis({ maxRetriesPerRequest: null });

interface PdfPayload {
	jobId: string;
	filePath: string;
	originalFilename: string;
}
new Worker<PdfPayload>(
	"jobs",
	async (job) => {
		const pdfPath = job.data.filePath;
		const data = await readFile(pdfPath);
		const parser = new PDFParse({ data });
		const result = await parser.getText();
		if (!result) {
			await rm(pdfPath);
			throw new Error("Pdf is empty");
		}
		console.log(result);
		await rm(pdfPath);
		return { jobId: job.id, textLength: result.text.length };
	},
	{ connection },
);
