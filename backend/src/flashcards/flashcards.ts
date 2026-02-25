import * as z from "zod";
interface Flashcard {
	front: string;
	back: string;
	topic: string;
}
export const responseFormat = z.object({
	front: z.string(),
	back: z.string(),
	topic: z.string(),
});
