import express from "express";
import {UserPhraseService} from "../service/UserPhraseService";
import {authMiddleware} from "../auth/authMiddleware";
// @ts-ignore
import {InitDataParsed} from "@telegram-apps/init-data-node";


const router = express.Router();

function userPhraseRouter(userPhrasesService: UserPhraseService) {

    router.get('/getPhrase', authMiddleware, async (req,  res) => {
        try {
            const initData = res.locals.initData as InitDataParsed;

            const id = initData.user?.id

            if (id != undefined) {
                const user = await userPhrasesService.getPhrase(id.toString());
                console.log("phrase - ",user)
                if (!user) {
                    res.status(404).json({message: 'User not found'});
                } else {
                    res.status(200).json({phrase: user});
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении буста:', error);
            res.status(400).json({message: error});
        }
    })

    router.get('/getUserPhraseData', authMiddleware, async (req,  res) => {
        try {
            const initData = res.locals.initData as InitDataParsed;

            const id = initData.user?.id

            if (id != undefined) {
                const user = await userPhrasesService.getUserPhraseData(id.toString());
                console.log("dats = ", user)
                if (!user) {
                    res.status(404).json({message: 'User not found'});
                } else {
                    res.status(200).json(user);
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении буста:', error);
            res.status(400).json({message: error});
        }
    })

    return router
}

export default userPhraseRouter;