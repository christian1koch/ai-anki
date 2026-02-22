import Fastify from "fastify";
import multipartPlugin from "@fastify/multipart";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { randomUUID } from "node:crypto";
import { PDFParse } from "pdf-parse";
import { readFile, writeFile, rm } from "node:fs/promises";

const connection = new IORedis({ maxRetriesPerRequest: null });
const app = Fastify();
const queue = new Queue("jobs", { connection });

app.register(multipartPlugin);

app.get("/health", async () => {
	return { status: "ok" };
});

// Mock Worker
const DEBUG_WORKER_ERROR = true;
interface PdfPayload {
	jobId: string;
	filePath: string;
	originalFilename: string;
}

const pdfTextExtractionWorker = new Worker<PdfPayload>(
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
		return { jobId: job.id, textLength: result };
	},
	{ connection, autorun: false },
);

app.post("/jobs", async (request, reply) => {
	const data = await request.saveRequestFiles();
	if (!data.length) {
		reply.code(400).send({ error: "No file uploaded." });
		return;
	}
	if (data.length > 1) {
		reply.code(400).send({ error: "We don't support more than one file." });
		return;
	}
	if (data[0].mimetype !== "application/pdf") {
		reply.code(400).send({ error: "filetype must be pdf." });
		return;
	}
	const jobId = randomUUID();
	const file = await readFile(data[0].filepath);
	const filePath = `./public/uploads/${jobId}.pdf`;
	await writeFile(filePath, file);
	const originalFilename = data[0].filename;
	const payload = { jobId, filePath, originalFilename };
	await queue.add("process_pdf", payload, { jobId });
	pdfTextExtractionWorker.run();
	reply.code(202).send({ jobId, status: "queued" });
});

enum JobStatus {
	QUEUED = "queued",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

app.get<{ Params: { jobId: string } }>(
	"/jobs/:jobId/status",
	async (request, reply) => {
		const { jobId } = request.params;

		const job = await queue.getJob(jobId);
		if (!job) {
			return reply.code(404).send({ error: "Job Doesn't exist" });
		}
		const jobState = await job.getState();
		let status = JobStatus.QUEUED;
		switch (jobState) {
			case "active":
				status = JobStatus.PROCESSING;
				break;
			case "completed":
				status = JobStatus.COMPLETED;
				break;
			case "failed":
				status = JobStatus.FAILED;
				const payload = {
					jobId,
					status,
					error: "Sorry, the Job failed",
				};
				console.log(job.failedReason);
				return reply.code(200).send(payload);
			default:
				console.log("Original job State ", jobState);
				status = JobStatus.QUEUED;
				break;
		}
		const payload = { jobId, status: status };

		return reply.code(200).send(payload);
	},
);

app.listen({ port: 4000 }, (err, address) => {
	if (err) throw err;
	console.log(`Server running at ${address}`);
});
