import { Request, Response } from 'express';
import { Connection } from 'mysql2/promise';

export class ImageService {
    constructor(private db: Connection) {}

    // Метод для загрузки изображения и сохранения в БД
    async uploadImage  (req: Request, res: Response)  {
        try {
            const file = req.file; // Файл переданный через multer
            const { name } = req.body; // Имя, переданное в запросе

            if (!file) {
                return res.status(400).json({ message: 'Файл не загружен' });
            }

            // Путь к файлу
            const filePath = `/api/img/${file.filename}`;

            // SQL-запрос на сохранение данных в БД
            const insertQuery = `
            INSERT INTO images (name, path) 
            VALUES (?, ?)
        `;
            await this.db.execute(insertQuery, [name, filePath]);

            // Успешный ответ
            return res.status(200).json({ message: 'Файл загружен и данные сохранены', filePath });
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            return res.status(500).json({ message: 'Ошибка при загрузке файла' });
        }
    };

    // Метод для получения всех изображений из БД
    async getImages(req: Request, res: Response) {
        try {
            const [rows] = await this.db.execute('SELECT * FROM images');
            res.status(200).json(rows);
        } catch (error) {
            console.error('Ошибка при получении изображений:', error);
            res.status(500).json({ message: 'Ошибка сервера.' });
        }
    }
}
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });