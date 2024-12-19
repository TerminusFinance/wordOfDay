import express from "express";
import TelegramService from "../service/TelegramService";
import {authFromCode} from "../auth/authFromCode";
import {ImageService, upload} from "../service/ImageService";
import {AdminService} from "../service/AdminService";

const router = express.Router();

function adminsRouter(
                      telegramService: TelegramService,
                      imageService: ImageService,
                      adminService: AdminService
) {


    router.post('/tBot/broadcastMessage', authFromCode, async (req, res) => {
        try {
            const {message, image} = req.body
            await telegramService.broadcastMessage(message, image);
            res.status(200).json("Рассылка успешно завершенна")
        } catch (e) {
            console.error("error in broadcastMessage",e)
            res.status(400).json({ message: e });
        }
    })


    // @ts-ignore
    router.post('/uploadImage', upload.single('image'), (req, res) => {
        imageService.uploadImage(req, res);
    });

    router.get('/getImages', authFromCode, async (req, res) => {
        imageService.getImages(req, res)
    })

    router.post('/deleteUser', authFromCode, async (req, res) => {
        try {
            const {userId} = req.body;

            const result = await adminService.deleteUserById(userId);
            res.status(200).json(result);
        } catch (error) {
            console.error("error in delete users",error)
            res.status(400).json({ message: error });
        }
    });


    return router;

}

export default adminsRouter;