import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";


const englishPhrasesPath = path.join(__dirname, "english_phrases.json");
const russianPhrasesPath = path.join(__dirname, "russian_phrases.json");

// Инициализация OpenAI
const openai = new OpenAI({
    apiKey: "sk-svcacct-7nqMLi9FyfRyY5ytqdYIlM5PhyoYRa3l3fJzJNbEr2cqueSKHWb7YDPj9rFr9Dx4rshQerT3BlbkFJKzfiuBK17HuJNbmpgWT1zvuMtVu20Ev_AKi9tjhamSs-kfqhCODtZ6TNhmrmS5Zt3yA2QA"
});

export class PhraseService {

    /**
     * Проверка и создание файла, если он не существует.
     * @param filePath Путь к файлу.
     */
    private async ensureFileExists(filePath: string): Promise<void> {
        try {
            await fs.access(filePath); // Проверяем доступность файла
        } catch {
            await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8"); // Создаем пустой файл
        }
    }

    /**
     * Генерация английских фраз.
     */
    private async generateEnglishPhrases(): Promise<void> {
        await this.ensureFileExists(englishPhrasesPath);

        const phrases: string[] = [];
        const batchSize = 10; // Генерировать 10 фраз за один запрос


            try {

                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini", // Или text-davinci-003, если turbo недоступна
                    messages: [
                        {
                            role: "user",
                            content: `Generate ${batchSize} short motivational phrases (up to 4 words) in English.`,
                        },
                    ],
                });
                console.log("response is to-", response.choices[0].message)


                const batchPhrases =
                    response.choices[0]?.message?.content
                        ?.split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line) || [];

                phrases.push(...batchPhrases);

                // Сохранять текущие результаты на случай ошибки
                await fs.writeFile(englishPhrasesPath, JSON.stringify(phrases, null, 2), "utf-8");
                console.log(`Saved ${batchPhrases.length} phrases from request ${1}.`);

            } catch (error: any) {
                console.error(`Error during request ${ 1}:`, error);

                if (error.status === 429) {
                    console.warn("Rate limit reached. Retrying after 60 seconds...");
                    await new Promise((resolve) => setTimeout(resolve, 60000)); // Длительная задержка

                } else {
                    throw new Error(`Failed during request ${ 1}`);
                }
            }


        console.log("All phrases generated and saved successfully!");
    }

    /**
     * Генерация русских фраз.
     */
    private async generateRussianPhrases(): Promise<void> {
        await this.ensureFileExists(russianPhrasesPath); // Проверка файла

        try {

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    {
                        role: "user",
                        content: "Write a haiku about recursion in programming.",
                    },
                ],
            });

            console.log(completion.choices[0].message);
            // const response = await openai.chat.completions.create({
            //     model: "gpt-4",
            //     messages: [{
            //         role: "user",
            //         content: "Сгенерируйте 50 коротких мотивационных фраз (до 4 слов) на русском языке."
            //     }],
            // });

            // const phrases = response.choices[0]?.message?.content
            //     ?.split("\n")
            //     .filter((line) => line.trim()) || [];
            //
            // await fs.writeFile(russianPhrasesPath, JSON.stringify(phrases, null, 2), "utf-8");
            console.log("Russian phrases generated and saved successfully!");
        } catch (error) {
            console.error("Error generating Russian phrases:", error);
            throw new Error("Failed to generate Russian phrases");
        }
    }

    /**
     * Генерация всех фраз.
     */
    async generatePhrases(): Promise<void> {
        await Promise.all([this.generateEnglishPhrases(),
            // this.generateRussianPhrases()
            ]
        );
    }

    /**
     * Получение английских фраз.
     */
    async getEnglishPhrases(): Promise<string[]> {
        await this.ensureFileExists(englishPhrasesPath); // Проверка файла

        try {
            const fileContent = await fs.readFile(englishPhrasesPath, "utf-8");
            return JSON.parse(fileContent);
        } catch (error) {
            console.error("Error reading English phrases file:", error);
            throw new Error("Failed to read English phrases file");
        }
    }

    /**
     * Получение русских фраз.
     */
    async getRussianPhrases(): Promise<string[]> {
        await this.ensureFileExists(russianPhrasesPath); // Проверка файла

        try {
            const fileContent = await fs.readFile(russianPhrasesPath, "utf-8");
            return JSON.parse(fileContent);
        } catch (error) {
            console.error("Error reading Russian phrases file:", error);
            throw new Error("Failed to read Russian phrases file");
        }
    }
}