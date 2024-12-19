// @ts-ignore
import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import path from 'path';
// @ts-ignore
import fs from 'fs';
import {connectDatabase} from './bd';
import userRouter from "./routes/userRouter";
import {UserService} from "./service/userService";
import {UserPhraseService} from "./service/UserPhraseService";
import userPhraseRouter from "./routes/userPhraseRouter";
import bot from "./bot/Bot";
import taskRouter from "./routes/taskRouter";
import TaskService from "./service/TaskService";
import {PhraseService} from "./service/PhraseService";
import phraseRouter from "./routes/phraseRouter";
import TelegramService from "./service/TelegramService";
import adminsRouter from "./routes/adminRouter";
import {getManifest} from "./routes/manifestRouter";
import {ImageService} from "./service/ImageService";
import {AdminService} from "./service/AdminService";
import acquisitionsRouter from "./routes/acquistionsRoutre";
import AcquisitionsService from "./service/AcquisitionsService";


const app = express();
const port = 3000;
bot
app.use(express.json());
app.use(cors());

console.log("Bot polling has started.");

connectDatabase().then(db => {
    const userService = new UserService(db);
    const userPhraseService = new UserPhraseService(db);
    const taskService = new TaskService(db);
    const phraseService = new PhraseService();
    const telegramService = new TelegramService(db);
    const imageService = new ImageService(db);
    const adminService = new AdminService(db);
    const acquisitionsService = new AcquisitionsService(db)
    app.use('/api/users', userRouter(userService));
    app.use('/api/phrase', userPhraseRouter(userPhraseService))
    app.use('/api/task', taskRouter(taskService));
    app.use('/api/phrase', phraseRouter(phraseService))

    app.use('/api/adm', adminsRouter(telegramService, imageService, adminService));
    app.use('/api/acquisitions', acquisitionsRouter(acquisitionsService))
    // app.use('/api/pools', poolsRouter(poolsController))

    app.get('/api/img/:filename', (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads', filename);

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({message: 'File not found'});
        }
    });

    app.get('/api/manifest', getManifest);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database', error);
});