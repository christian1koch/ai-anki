export interface TextSplitConfig {
	chunkSize: number;
	chunkOverlap: number;
}
// Sliding window algoirithm for chunking
export function chunkText(text: string, config: TextSplitConfig) {
	const { chunkSize, chunkOverlap } = config;
	if (chunkSize <= chunkOverlap) {
		console.debug("chunkSize must be bigger than chunkOverlap");
		return [];
	}
	const normalizeText = text.trim();
	const chunks: string[] = [];
	let start = 0;
	let end = chunkSize;
	const stride = chunkSize - chunkOverlap;
	while (start <= normalizeText.length - 1) {
		const chunk = normalizeText.substring(start, end);
		chunks.push(chunk);
		start = start + stride;
		end = end + stride;
	}

	return chunks;
}
