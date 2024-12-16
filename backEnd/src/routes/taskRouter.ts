import express from "express";
import {authMiddleware} from "../auth/authMiddleware";
// @ts-ignore
import {InitDataParsed} from "@telegram-apps/init-data-node";
import {authFromCode} from "../auth/authFromCode";
import TaskService from "../service/TaskService";

const router = express.Router();

function taskRouter(taskService: TaskService) {

    router.post('/createTask', authFromCode, async (req, res) => {
        try {
            const { text, coins, checkIcon, taskType, type, rewards, isVisible,sortLocal, completeLimit } = req.body;
            const task = await taskService.addTask(text, coins, checkIcon, taskType, type, rewards, isVisible,sortLocal, completeLimit);
            res.status(200).json(task);
        } catch (error) {
            console.error("error - ",error)
            res.status(400).json({ message: error });

        }
    });

    router.patch('/updateTaskCompletion', authMiddleware, async (req, res) => {
        try {
            const { taskId, completed } = req.body;
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id
            if(userId != undefined) {
                await taskService.updateTaskCompletion(userId.toString(), taskId, completed);
                res.status(200).json({ message: 'Task completion status updated successfully' });
            }
        } catch (error) {
            res.status(400).json({ message: error });
        }
    });


    router.get('/getAllTasks', async (req, res) => {
        try {
            const task = await taskService.getAllTasks();
            res.status(200).json(task);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    });

    router.post('/updateTask', authFromCode,async (req, res) => {
        try {
            const { taskId, updatedFields } = req.body;
            await taskService.updateTask(taskId, updatedFields);
            const updatedTask = await taskService.getTaskById(taskId);
            if (updatedTask) {
                res.status(200).json(updatedTask);
            } else {
                res.status(404).json({ message: 'Task not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error });
        }
    });

    router.delete('/deleteTask', authFromCode, async (req, res) => {
        try {
            const { taskId } = req.body;
            await taskService.deleteTask(taskId);
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error });
        }
    });

    router.post('/checkSuccessTask', authMiddleware, async (req, res) => {
        try {
            const { taskId } = req.body;
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id;

            if (userId != undefined) {
                const result = await taskService.checkSuccessTask(userId.toString(), taskId);
                console.log("checkSuccessTask result",result)
                if (typeof result === 'string') {
                    res.status(400).json({ message: result });
                } else {
                    res.status(200).json(result);
                }
            } else {
                res.status(400).json({ message: 'User ID not found' });
            }
        } catch (error) {
            console.log("error in checkSuccessTask - ", error)
            res.status(400).json({ message: error });
        }
    });


    router.get('/getTaskForUser', authMiddleware, async (req, res) => {
        try {
            const initData = res.locals.initData as InitDataParsed;
            const userId = initData.user?.id;
            if (userId != undefined) {
                const task = await taskService.getTaskForUser(userId.toString());
                res.status(200).json(task);
            }
        } catch (error) {
            res.status(400).json({ message: error });
        }
    })

    return router;
}

export default taskRouter;