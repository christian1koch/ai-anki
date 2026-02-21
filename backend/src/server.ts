import Fastify from "fastify";
const app = Fastify();

app.get("/health", async () => {
	return { status: "ok" };
});

app.listen({ port: 4000 }, (err, address) => {
	if (err) throw err;
	console.log(`Server running at ${address}`);
});
