export interface TextSplitConfig {
	chunkSize: number;
	chunkOverlap: number;
}
// Sliding window algoirithm for chunking
/**
 * const chunkSize = 5
 * const chunkOverlap = 0
 * const stride =
 * stride = windowSize - Olverap
 * const textSize = 10
 * [].size 5 [].size
 * my name is chris codes
 * codes who loves coding
 *
 */
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
// Debug testing
// const text = "I am chris codes and I love to code <3";
// const config = {
// 	chunkSize: 5,
// 	chunkOverlap: 2,
// };
// console.log(chunkText(text, config));
