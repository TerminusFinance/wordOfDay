import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";


    // Указываем путь к папке phrases
    const phrasesFolder = path.join(__dirname, "../../phrases");

    // Указываем путь к файлам внутри этой папки
    const englishPhrasesPath = path.join(phrasesFolder, "english_phrases.json");
    const russianPhrasesPath = path.join(phrasesFolder, "russian_phrases.json");

    console.log("English phrases path:", englishPhrasesPath);
    console.log("Russian phrases path:", russianPhrasesPath);

// Инициализация OpenAI
const openai = new OpenAI({
    apiKey: "sk-svcacct-7nqMLi9FyfRyY5ytqdYIlM5PhyoYRa3l3fJzJNbEr2cqueSKHWb7YDPj9rFr9Dx4rshQerT3BlbkFJKzfiuBK17HuJNbmpgWT1zvuMtVu20Ev_AKi9tjhamSs-kfqhCODtZ6TNhmrmS5Zt3yA2QA"
});

export class PhraseService {

    /**
     * Проверка и создание файла, если он не существует.
     * @param filePath Путь к файлу.
     */
    /**
     * Проверка и создание файла, если он не существует.
     * Также создаёт директорию, если её нет.
     * @param filePath Путь к файлу.
     */
    private async ensureFileExists(filePath: string): Promise<void> {
        const dirPath = path.dirname(filePath); // Путь к папке

        try {
            await fs.mkdir(dirPath, { recursive: true }); // Создание папки, если её нет
        } catch (err) {
            console.error(`Error creating directory ${dirPath}:`, err);
            throw new Error(`Failed to create directory: ${dirPath}`);
        }

        try {
            await fs.access(filePath); // Проверяем доступность файла
        } catch {
            // Если файла нет, создаём его с пустым массивом
            await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
        }
    }

    /**
     * Генерация английских фраз.
     */
    private async generateEnglishPhrases(): Promise<void> {
        await this.ensureFileExists(englishPhrasesPath);

        const phrases: string[] = [];
        const batchSize = 50;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: `Generate exactly ${batchSize} short motivational phrases in English. 
                    Each phrase should be on a separate line, without numbers or extra text. Only return the phrases.`,
                    },
                ],
            });

            const rawContent = response.choices[0]?.message?.content || "";
            const batchPhrases = rawContent
                .split("\n") // Разбиваем по строкам
                .map((line) => line.trim()) // Убираем пробелы
                .filter((line) => line); // Убираем пустые строки

            phrases.push(...batchPhrases);

            // Сохраняем результат в файл
            await fs.writeFile(englishPhrasesPath, JSON.stringify(phrases, null, 2), "utf-8");
            console.log(`Saved ${batchPhrases.length} phrases successfully.`);
        } catch (error: any) {
            console.error("Error:", error);

            if (error.status === 429) {
                console.warn("Rate limit reached. Retrying after 60 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 60000)); // Задержка на 60 секунд
            } else {
                throw new Error("Failed to generate phrases");
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
            const batchSize = 50; // Количество фраз
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{
                    role: "user",
                    content: `Сгенерируйте ${batchSize} коротких мотивационных фраз (до 4 слов) на русском языке без номеров, только сами фразы.`,
                }],
            });

            // Извлечение и очистка фраз
            const rawContent = response.choices[0]?.message?.content || "";
            const phrases = rawContent
                .split("\n") // Разделяем строки
                .map((line) => line.replace(/^\d+\.\s*/, "").trim()) // Убираем номера строк
                .filter((line) => line && !line.toLowerCase().includes("сгенерируйте")); // Исключаем пустые строки и вводный текст

            if (phrases.length !== batchSize) {
                console.warn(`Warning: Expected ${batchSize} phrases, but got ${phrases.length}`);
            }

            // Сохраняем только новые фразы
            await fs.writeFile(russianPhrasesPath, JSON.stringify(phrases, null, 2), "utf-8");
            console.log(`Saved ${phrases.length} Russian phrases successfully!`);
        } catch (error: any) {
            console.error("Error generating Russian phrases:", error);

            // Повторная попытка при превышении лимита запросов
            if (error.status === 429) {
                console.warn("Rate limit reached. Retrying after 60 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 60000));
                return this.generateRussianPhrases(); // Повторяем запрос
            }

            throw new Error("Failed to generate Russian phrases");
        }
    }
    /**
     * Генерация всех фраз.
     */
    async generatePhrases(): Promise<void> {
        await Promise.all([
            this.generateEnglishPhrases(),
            this.generateRussianPhrases()
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