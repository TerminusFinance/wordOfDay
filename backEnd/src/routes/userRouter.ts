// @ts-ignore
import express, {Request, Response} from 'express';
import {UserService} from '../service/userService';
import {authMiddleware} from "../auth/authMiddleware";
// @ts-ignore
import {InitDataParsed} from "@telegram-apps/init-data-node";

const router = express.Router();

function userRouter(userService: UserService) {
    router.post('/createNewUsers', authMiddleware, async (req: Request, res: Response) => {
        const {address} = req.body;
        try {
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id
            const name = initData.user?.firstName
            console.log("userID",userId, "name - ",name)
            if (userId != undefined && name != undefined) {
                const user = await userService.createUser(userId.toString(), name, address);
                res.status(201).json(user);
            }
        } catch (error) {
            res.status(400).json({message: error});
        }
    });

    router.get('/getUser', authMiddleware, async (req: Request, res: Response) => {

        try {
            const initData = res.locals.initData as InitDataParsed;

            const id = initData.user?.id

            if (id != undefined) {
                const user = await userService.getUserById(id.toString());
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
    });


    router.put('/updateUsers', authMiddleware, async (req: Request, res: Response) => {
        try {
            const initData = res.locals.initData as InitDataParsed;

            const id = initData.user?.id
            if (id != undefined) {
                const updatedUser = await userService.updateUser(id.toString(), req.body);
                res.status(200).json(updatedUser);
            }
        } catch (error) {
            console.error(error)
            res.status(400).json({message: error});
        }
    });


    router.post('/processInvitation', authMiddleware, async (req, res) => {
        try {
            const {inviteCode} = req.body;
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id
            const name = initData.user?.firstName
            const prem = initData.user?.isPremium
            if (userId != undefined && name != undefined) {
                const user = await userService.processInvitation(inviteCode, userId.toString(), name, prem ? prem : false);
                res.status(201).json(user);
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({message: error});
        }
    });


    router.get("/getInviterUsers", authMiddleware, async (req, res)=> {
        try {
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id
            if (userId != undefined) {
                const result =await userService.getInviterUsers(userId.toString())
                res.status(200).json(result)
            }
        } catch (error) {
            res.status(400).json({message: error});
        }
    })

    router.get("/getCountUserInvited", authMiddleware, async (req, res)=> {
        try {
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id
            if (userId != undefined) {
                const result =await userService.getCountUserInvited(userId.toString())
                res.status(200).json(result)
            }
        } catch (error) {
            res.status(400).json({message: error});
        }
    })

    return router;
}

export default userRouter;
