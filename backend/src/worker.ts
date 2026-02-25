import IORedis from "ioredis";
import { Worker } from "bullmq";
import { readFile, rm } from "fs/promises";
import { PDFParse } from "pdf-parse";
import { chunkText, TextSplitConfig } from "./utils/chunking";
import { createAgent } from "langchain";

const connection = new IORedis({ maxRetriesPerRequest: null });
const config: TextSplitConfig = {
	chunkOverlap: 50,
	chunkSize: 100,
};
interface PdfPayload {
	jobId: string;
	filePath: string;
	originalFilename: string;
}

const agent = createAgent({
	model: "openai:gpt-5",
	tools: [],
});

new Worker<PdfPayload>(
	"jobs",
	async (job) => {
		const pdfPath = job.data.filePath;
		const data = await readFile(pdfPath);
		const parser = new PDFParse({ data });
		const result = await parser.getText();
		if (!result.text.trim()) {
			await rm(pdfPath);
			throw new Error("Pdf is empty");
		}
		const chunkedResult = chunkText(result.text, config);
		if (chunkedResult.length === 0) {
			await rm(pdfPath);
			throw new Error("Chunks are empty");
		}
		await rm(pdfPath);
		const res = {
			jobId: job.id,
			textLength: result.text.length,
			chunkCount: chunkedResult.length,
		};
		console.log("res", res);
		return res;
	},
	{ connection },
);
