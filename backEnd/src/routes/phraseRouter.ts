import express, {Request, Response} from "express";
import {PhraseService} from "../service/PhraseService";
import {authFromCode} from "../auth/authFromCode";


const router = express.Router();

function phraseRouter(phraseService: PhraseService) {


    router.get('/generatePhrase', authFromCode, async (req: Request, res: Response) => {

        try {

            await phraseService.generatePhrases();
            res.status(200).json('generate is success')

        } catch (error) {
            console.error('Ошибка generatePhrase:', error);
            res.status(400).json({message: error});
        }
    });


    router.get('/getEngPhrase', async (req: Request, res: Response) => {
        try {

            const phrase = await phraseService.getEnglishPhrases();
            res.status(200).json({phrase: phrase})

        } catch (error) {
            console.error('Ошибка getPhrase:', error);
            res.status(400).json({message: error});
        }
    })


    router.get('/getRusPhrase', async (req: Request, res: Response) => {
        try {

            const phrase = await phraseService.getRussianPhrases();
            res.status(200).json({phrase: phrase})

        } catch (error) {
            console.error('Ошибка getPhrase', error);
            res.status(400).json({message: error});
        }
    })


    return router
}

export default phraseRouter;