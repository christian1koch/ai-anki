import Fastify from "fastify";
import multipartPlugin from "@fastify/multipart";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { randomUUID } from "node:crypto";

const connection = new IORedis();
const app = Fastify();
const queue = new Queue("jobs", { connection });

app.register(multipartPlugin);

app.get("/health", async () => {
	return { status: "ok" };
});

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
	const filePath = data[0].filepath;
	const originalFilename = data[0].filename;
	const payload = { jobId, filePath, originalFilename };
	await queue.add("process_pdf", payload, { jobId });
	reply.code(202).send({ jobId, status: "queued" });
});

app.listen({ port: 4000 }, (err, address) => {
	if (err) throw err;
	console.log(`Server running at ${address}`);
});
