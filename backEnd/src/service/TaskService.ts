// @ts-ignore
import mysql, {Connection, RowDataPacket} from "mysql2/promise";
import {
    ISCheckFriends,
    IsCheckNftTask,
    IsCheckStarsSendersTask,
    ISDailyTask,
    IsDaysChallengeTask,
    IsInternalChallengeTask,
    IsOpenUrl,
    IsStockReg,
    isStockTrTask,
    IsSubscribeToTg,
    IsTransferToneTask,
    Rewards,
    StoredValuesDayChallenge,
    Task,
    TaskCardProps,
    TaskType,
    UserTask,
    UserTaskFormated
} from "../types/Types";
import {User} from "../types/userTypes";
import {UserService} from './userService';
import {toNano} from "ton-core";
import AcquisitionsService from "../service/AcquisitionsService";
import {checkedStakedToken} from "../tonwork/TrStockChecked";
import {CheckTransactions, isUserSubscribed, sendToCheckUserHaveNftFromCollections} from "../tonwork/CheckToNftitem";


class TaskService {
    private userService!: UserService;

    constructor(private db: Connection) {
    }

    setUserService(userService: UserService) {
        this.userService = userService;
    }

    async checkAndUpdateTasksForUser(userId: string) {
        const userTasksSql = `
            SELECT t.id AS taskId,
                   t.taskType,
                   ut.etaps,
                   ut.lastCompletedDate,
                   ut.completed,
                   ut.storedValues,
                   t.type
            FROM tasks t
                     JOIN userTasks ut ON t.id = ut.taskId
            WHERE ut.userId = ?
        `;
        const [rowUserTasks] = await this.db.execute(userTasksSql, [userId]);
        let userTasks = rowUserTasks as UserTaskFormated[];

        for (const task of userTasks) {

            let parsedTaskType;
            try {
                parsedTaskType = JSON.parse(task.taskType);
            } catch (error) {
                console.error('Error parsing taskType:', error);
                continue;
            }

            const taskWithParsedType = {
                ...task,
                taskType: parsedTaskType
            };
            if (task.etaps == 1 || task.etaps == 3) {
                if (IsDaysChallengeTask(taskWithParsedType.taskType)) {
                    console.log("Вошел в проверку IsDaysChallengeTask")
                    const currentDate = new Date().toISOString().split('T')[0];
                    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // 86400000 ms = 1 день
                    const storedValues = taskWithParsedType.storedValues;
                    if (storedValues) {
                        const parsedStoredValues = JSON.parse(storedValues);
                        const resultDate = parsedStoredValues as StoredValuesDayChallenge;
                        if (resultDate.dateLastComplete === yesterdayDate) {
                            await this.updateUserTask(userId, taskWithParsedType.taskId, {
                                etaps: 0,
                            });
                        } else if (resultDate.dateLastComplete !== yesterdayDate && resultDate.dateLastComplete !== currentDate) {
                            const resultDate: StoredValuesDayChallenge = {
                                dayCompleted: 1,
                                dateLastComplete: currentDate
                            }
                            taskWithParsedType.storedValues = JSON.stringify(resultDate);
                            await this.db.execute(`
                                UPDATE userTasks
                                SET storedValues = ?
                                WHERE taskId = ?
                                  AND userId = ?
                            `, [taskWithParsedType.storedValues, taskWithParsedType.taskId, userId]);
                        }
                    }

                } else {
                    await this.checkSuccessTask(userId, task.taskId);
                }
            } else if (taskWithParsedType.type == "DailyTask") {
                console.log("parsedTaskType - ", parsedTaskType)
                const lastDateUpdate = taskWithParsedType.lastCompletedDate
                const currentDate = new Date().toISOString().split('T')[0];
                console.log("lastDateUpdate:", lastDateUpdate);
                console.log("currentDate:", currentDate);

                if ((!lastDateUpdate && taskWithParsedType.completed == true) || (lastDateUpdate !== currentDate && taskWithParsedType.completed == true)) {
                    console.log('Обновляем ежедневное задание');
                    taskWithParsedType.completed = false;
                    const updateTaskSql = `
                        UPDATE userTasks
                        SET completed = ?
                        WHERE userId = ?
                          AND taskId = ?
                    `;
                    await this.db.execute(updateTaskSql, [0, userId, task.taskId]);
                } else {
                    console.log("ignor")
                }
            }
        }
    }

    async checkSuccessTask(userId: string, taskId: number) {
        const tasks = await this.getTaskForUser(userId)
        const user = await this.userService.getUserById(userId);
        if (user != undefined) {
            if (tasks) {
                const userTask = tasks.find(task => task.taskId === taskId);
                if (userTask) {
                    if (userTask.completeLimit != null && userTask.completeLimit <= userTask.completeCount && userTask.isVisible === 0) {
                        return ""
                    } else if (userTask.isVisible === 1) {
                        return ""
                    } else {
                        if (IsCheckNftTask(userTask.taskType)) {
                            const resultCheck = await this.checkNftItem(user, userTask);
                            if (resultCheck === "Task completion status updated successfully") {
                                await this.checkToNextLimits(userTask)
                                const newUserState = await this.getTaskForUser(userId)
                                return newUserState;
                            } else {
                                return resultCheck;
                            }
                        } else if (IsSubscribeToTg(userTask.taskType)) {
                            const resultCheck = await this.checkSubscribeToTg(user, userTask);
                            if (resultCheck === "Task completion status updated successfully") {
                                await this.checkToNextLimits(userTask)
                                const newUserState = await this.getTaskForUser(userId)
                                return newUserState;
                            } else {
                                return resultCheck;
                            }
                        } else if (IsStockReg(userTask.taskType)) {
                            try {
                                const resultCheck = await this.checkStockReg(user, userTask);
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (error) {
                                return error;
                            }
                        } else if (IsOpenUrl(userTask.taskType)) {
                            try {
                                const resultCheck = await this.checkOpenUrlReg(user, userTask);
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (error) {
                                return error;
                            }
                        } else if (ISCheckFriends(userTask.taskType)) {
                            try {
                                console.error("isCheckFriendsTask voshol")
                                const resultCheck = await this.checkFriendsAction(user, userTask);
                                console.error("isCheckFriendsTask resultCheck -", resultCheck)
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (e) {
                                return e;
                            }
                        } else if (ISDailyTask(userTask.taskType)) {
                            try {
                                console.error("isCheckFriendsTask voshol")
                                const resultCheck = await this.checkDailyTaskAction(user, userTask);
                                console.error("isCheckFriendsTask resultCheck -", resultCheck)
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (e) {
                                return e;
                            }
                        }
                        // else if (IsInternalChallengeTask(userTask.taskType)) {
                        //     try {
                        //         console.error("IsInternalChallengeTask voshol")
                        //         const resultCheck = await this.checkInternalChallenge(user, userTask);
                        //         console.error("IsInternalChallengeTask resultCheck -", resultCheck)
                        //         if (resultCheck === "Task completion status updated successfully") {
                        //             await this.checkToNextLimits(userTask)
                        //             const newUserState = await this.getTaskForUser(userId)
                        //             return newUserState;
                        //         } else {
                        //             return resultCheck;
                        //         }
                        //     } catch (e) {
                        //         return e;
                        //     }
                        // }
                        // else if (IsTransferToneTask(userTask.taskType)) {
                        //     try {
                        //         console.error("IsInternalChallengeTask voshol")
                        //         const resultCheck = await this.checkTransOptions(user, userTask);
                        //         console.error("IsInternalChallengeTask resultCheck -", resultCheck)
                        //         if (resultCheck === "Task completion status updated successfully") {
                        //             await this.checkToNextLimits(userTask)
                        //             const newUserState = await this.getTaskForUser(userId)
                        //             return newUserState;
                        //         } else {
                        //             return resultCheck;
                        //         }
                        //     } catch (e) {
                        //         return e;
                        //     }
                        // }
                        else if (IsCheckStarsSendersTask(userTask.taskType)) {
                            try {
                                console.error("IsInternalChallengeTask voshol")
                                const resultCheck = await this.checkStarsSenders(user, userTask);
                                console.error("IsInternalChallengeTask resultCheck -", resultCheck)
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (e) {
                                return e;
                            }
                        } else if (IsDaysChallengeTask(userTask.taskType)) {
                            try {
                                console.error("IsDaysChallengeTask voshol")
                                const resultCheck = await this.checkDaysChallenge(user, userTask);
                                console.error("IsDaysChallengeTask resultCheck -", resultCheck)
                                if (resultCheck === "Task completion status updated successfully") {
                                    await this.checkToNextLimits(userTask)
                                    const newUserState = await this.getTaskForUser(userId)
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (e) {
                                return e;
                            }
                        } else if (isStockTrTask(userTask.taskType)) {
                            try {
                                console.error("IsDaysChallengeTask voshol")
                                const resultCheck = await this.checkIsStockTrTask(user, userTask);
                                console.error("IsDaysChallengeTask resultCheck -", resultCheck)
                                if (resultCheck === "Task completion status updated successfully") {
                                    const newUserState = await this.getTaskForUser(userId);
                                    return newUserState;
                                } else {
                                    return resultCheck;
                                }
                            } catch (e) {
                                return e;
                            }
                        }
                    }
                } else {
                    return "User task not found";
                }
            }
        }
        return "User not found";
    }

    async checkToNextLimits(selectedTask: UserTask) {
        if (selectedTask.completeLimit != null && selectedTask.completeLimit == selectedTask.completeCount + 1) {
            // добавить установку, и установить isVisible на 1
            const updateTaskWithVisibilitySql = `
                UPDATE tasks
                SET completeCount = completeCount + 1,
                    isVisible     = 1
                WHERE id = ?
            `;

            await this.db.execute(updateTaskWithVisibilitySql, [selectedTask.taskId]);
        } else {
            // просто добавить установку.
            const updateTaskSql = `
                UPDATE tasks
                SET completeCount = completeCount + 1
                WHERE id = ?
            `;

            await this.db.execute(updateTaskSql, [selectedTask.taskId]);
        }
    }


    async checkDaysChallenge(user: User, selectedTask: UserTask) {
        if (IsDaysChallengeTask(selectedTask.taskType)) {
            const storedValues = selectedTask.storedValues;
            // Получаем сегодняшнюю и вчерашнюю дату в формате "YYYY-MM-DD"
            const currentDate = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // 86400000 ms = 1 день
            console.log("storedValues is ", storedValues)
            const resultChecking = await CheckTransactions(user.userId, user.address, toNano(selectedTask.taskType.price), selectedTask.taskType.addressToTransfer)
            if (storedValues) {
                const parsedStoredValues = JSON.parse(storedValues);
                const resultDate = parsedStoredValues as StoredValuesDayChallenge;

                if (resultChecking == true) {
                    if (resultDate.dateLastComplete === currentDate) {
                        return "A transaction should be sorvered no more than once a day"
                    }
                    if (resultDate.dateLastComplete === yesterdayDate) {
                        if (resultDate.dayCompleted == selectedTask.taskType.days) {
                            await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
                        } else {
                            resultDate.dateLastComplete = currentDate;
                            resultDate.dayCompleted = resultDate.dayCompleted + 1
                            selectedTask.storedValues = JSON.stringify(resultDate);
                            await this.db.execute(`
                                UPDATE userTasks
                                SET storedValues = ?
                                WHERE taskId = ?
                                  AND userId = ?
                            `, [selectedTask.storedValues, selectedTask.taskId, user.userId]);

                            await this.updateUserTask(user.userId, selectedTask.taskId, {
                                etaps: 1,
                                dataSendCheck: currentDate,
                            });
                        }

                        return "Task completion status updated successfully"
                    } else {
                        resultDate.dateLastComplete = currentDate;
                        resultDate.dayCompleted = 1
                        selectedTask.storedValues = JSON.stringify(resultDate);
                        await this.db.execute(`
                            UPDATE userTasks
                            SET storedValues = ?
                            WHERE taskId = ?
                              AND userId = ?
                        `, [selectedTask.storedValues, selectedTask.taskId, user.userId]);

                        return "Task completion status updated successfully"
                    }
                } else {
                    return resultChecking
                }

            } else {
                if (resultChecking == true) {
                    const acquisitionsController = new AcquisitionsService(this.db)
                    const result = await acquisitionsController.getAcquisitions(user.userId)
                    console.log("result", result)
                    const resultDate: StoredValuesDayChallenge = {dayCompleted: 1, dateLastComplete: currentDate}
                    selectedTask.storedValues = JSON.stringify(resultDate);
                    await this.db.execute(`
                        UPDATE userTasks
                        SET storedValues = ?
                        WHERE taskId = ?
                          AND userId = ?
                    `, [selectedTask.storedValues, selectedTask.taskId, user.userId]);

                    await this.updateUserTask(user.userId, selectedTask.taskId, {
                        etaps: 1,
                        dataSendCheck: currentDate,
                    });

                } else {
                    return resultChecking
                }
                return "Task completion status updated successfully"
            }
        }
    }


    async checkStarsSenders(user: User, selectedTask: UserTask) {
        if (IsCheckStarsSendersTask(selectedTask.taskType)) {
            const acquisitionsController = new AcquisitionsService(this.db)
            const result = await acquisitionsController.getAcquisitions(user.userId)
            console.log("result", result)
            if (result) {
                if (selectedTask.taskType.unnecessaryWaste <= result.totalAmount) {
                    await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
                    return "Task completion status updated successfully";
                } else {
                    return "Less than the task";
                }
            } else {
                return "Less than the task";
            }
        }
    }

    // async checkTransOptions(user: User, selectedTask: UserTask) {
    //     if (IsTransferToneTask(selectedTask.taskType)) {
    //         if (user.address != undefined && user.address !== "") {
    //             try {
    //                 const resultChecking = await CheckTransactions(user.userId, user.address, toNano(selectedTask.taskType.price), selectedTask.taskType.addressToTransfer)
    //                 if (resultChecking == true) {
    //                     switch (selectedTask.taskType.rewardType) {
    //                         case "coin":
    //                             await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
    //                             break;
    //                         case "userLeague":
    //                             const userLeagueController = new UserTopController(this.db)
    //                             await userLeagueController.updateUserLeagueScore(user.userId, selectedTask.coins, "freescore");
    //                             await this.updateTaskCompletion(user.userId, selectedTask.taskId, true, false);
    //                             break;
    //                     }
    //                     return "Task completion status updated successfully"
    //                 } else {
    //                     return resultChecking
    //                 }
    //             } catch (e) {
    //                 return e
    //             }
    //         }
    //     }
    // }


    async checkIsStockTrTask(user: User, selectedTask: UserTask) {
        if (isStockTrTask(selectedTask.taskType)) {
            if (user.address != undefined && user.address != "") {
                const tokenAddressStakingTon = "EQCvvYuUi8RLMnTNTucMrmiNCcP_B8tXS9BGHh8pVhXJDxlP"
                const tokenAddressUsdtStaking = "EQARMNcfYPGjRWpWaS29wehw8ht01nTCgvsfv115FDzbsPAM"
                const resultCheck = await checkedStakedToken(user.address, selectedTask.taskType.class == "Staked" ? tokenAddressStakingTon : tokenAddressUsdtStaking)
                if (resultCheck == "Is Staked True") {
                    await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
                    return "Task completion status updated successfully";
                } else {
                    return "You didn't link the address"
                }
            } else {
                return "You didn't link the address"
            }
        }
    }

    // async checkInternalChallenge(user: User, selectedTask: UserTask) {
    //     if (IsInternalChallengeTask(selectedTask.taskType)) {
    //
    //         switch (selectedTask.taskType.nameChallenge) {
    //             case "walletAddress" :
    //                 if (user.address != undefined && user.address != "") {
    //                     await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
    //                     return "Task completion status updated successfully";
    //                 } else {
    //                     return "You didn't link the address"
    //                 }
    //             case "createClan" :
    //                 const controller = new ClanController(this.db)
    //                 const userClanResult = await controller.getUserClan(user.userId)
    //                 if (userClanResult.role != undefined && userClanResult.role == "creator") {
    //                     await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
    //                     return "Task completion status updated successfully";
    //                 } else {
    //                     return "You have not created a clan"
    //                 }
    //         }
    //         return "Task named is not supported";
    //     } else {
    //         return "Task has any type";
    //     }
    // }


    async checkDailyTaskAction(user: User, selectedTask: UserTask): Promise<string> {
        if (ISDailyTask(selectedTask.taskType)) {
            const lastDateUpdate = selectedTask.lastCompletedDate;
            const currentDate = new Date().toISOString().split('T')[0]; // Форматируем текущую дату до YYYY-MM-DD

            console.log("lastDateUpdate:", lastDateUpdate);
            console.log("currentDate:", currentDate);

            if (!lastDateUpdate || new Date(lastDateUpdate).toISOString().split('T')[0] !== currentDate) {
                console.log("Updating task completion status and date.");

                await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
                return "Task completion status updated successfully";
            } else {
                return "Task has already been completed today";
            }
        } else {
            return "Task has any type";
        }
    }


    async checkFriendsAction(user: User, selectedTask: UserTask) {
        if (ISCheckFriends(selectedTask.taskType)) {
            const result = await this.userService.getInviterUsers(user.userId)
            if (result.invitees != undefined) {
                console.error("checkFriendsAction ser.listUserInvited-", result.invitees)
                if (result.totalCount >= selectedTask.taskType.numberOfFriends) {
                    const resultSendTorequest = await this.updateTaskCompletion(user.userId, selectedTask.taskId, true)
                    resultSendTorequest
                    return "Task completion status updated successfully";
                } else {
                    return "An error occurred while have invited friends";
                }
            } else {
                console.error("checkFriendsAction ser.listUserInvited-", result.invitees)
                return "An error occurred while have invited friends";
            }
        }
    }

    // task checked method

    async checkSubscribeToTg(user: User, selectedTask: UserTask): Promise<string> {
        if (IsSubscribeToTg(selectedTask.taskType)) {
            const num = parseInt(user.userId, 10);
            const isSubscribed = await isUserSubscribed(755050714, selectedTask.taskType.id);

            if (isSubscribed) {
                console.log('User is subscribed to the channel');
                const resultSendTorequest = await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);
                resultSendTorequest
                return "Task completion status updated successfully";
            } else {
                console.log('User is not subscribed to the channel');
                return "User is not subscribed to the channel";
            }
        } else {
            return "User is not subscribed to the channel";
        }
    }


    async checkNftItem(user: User, selectedTask: UserTask) {
        if (IsCheckNftTask(selectedTask.taskType)) {
            const collectionAddress = selectedTask.taskType.checkCollectionsAddress;

            if (user.address != undefined && user.address !== "") {

                try {
                    const checkResult = await sendToCheckUserHaveNftFromCollections(user.address, collectionAddress);
                    if (checkResult.state) {
                        const resultSendTorequest = await this.updateTaskCompletion(user.userId, selectedTask.taskId, true)
                        resultSendTorequest
                        return "Task completion status updated successfully"
                    }
                } catch (error) {
                    console.error('Error checking NFT:', error);
                    console.error('An error occurred while checking the nft');
                    return "An error occurred while checking the nft"
                }
            } else {
                console.error('You don\'t have a ton wallet address linked');
                return "You don t have a ton wallet address linked"
            }
        }
    };

// протестить завтра
    async checkStockReg(user: User, selectedTask: UserTask) {
        if (IsStockReg(selectedTask.taskType)) {
            const currentDate = new Date();

            // // Получение данных задачи пользователя
            // const userTaskSql = `
            //     SELECT *
            //     FROM userTasks
            //     WHERE userId = ?
            //       AND taskId = ?
            // `;
            //
            // const [userTaskRows] = await this.db.execute<mysql.RowDataPacket[]>(userTaskSql, [user.userId, selectedTask.taskId]);
            // const userTask = userTaskRows[0] as UserTaskFormated | undefined;
            //
            // if (!userTask) {
            //     throw new Error('Task not found for the user.');
            // }

            let {etaps, dataSendCheck} = selectedTask;

            // Если etaps или dataSendCheck равны null, считаем, что задача не начата
            if (etaps === null || dataSendCheck === null) {
                etaps = 0;
                dataSendCheck = currentDate.toISOString();
            }

            if (etaps === 0) {
                // Перевод на этап 1 и сохранение текущей даты
                await this.updateUserTask(user.userId, selectedTask.taskId, {
                    etaps: 1,
                    dataSendCheck: currentDate.toISOString(),
                });
                return "Task completion status updated successfully";

            } else if (etaps === 1) {
                // Проверка, прошло ли больше 24 часов с момента сохраненной даты
                if (dataSendCheck) {
                    const savedDate = new Date(dataSendCheck);
                    const nextDay = new Date(savedDate);
                    nextDay.setDate(savedDate.getDate() + 1);
                    console.error("nextDay - ", nextDay);
                    if (currentDate > nextDay) {
                        // Перевод на этап 2
                        console.error("перевод на newDay");
                        await this.updateUserTask(user.userId, selectedTask.taskId, {etaps: 2});
                        return "Task completion status updated successfully";
                    } else {
                        console.error("less than 24 hours have passed since the last update.");
                        throw new Error('Less than 24 hours have passed since the last update.');
                    }
                } else {
                    throw new Error('Invalid dataSendCheck value.');
                }

            } else if (etaps === 2) {
                // Перевод на этап 3 и сохранение текущей даты
                await this.updateUserTask(user.userId, selectedTask.taskId, {
                    etaps: 3,
                    dataSendCheck: currentDate.toISOString(),
                });
                return "Task completion status updated successfully";

            } else if (etaps === 3) {
                // Проверка, прошло ли больше 24 дней с момента сохраненной даты
                if (dataSendCheck) {
                    const savedDate = new Date(dataSendCheck);
                    const nextMonth = new Date(savedDate);
                    nextMonth.setDate(savedDate.getDate() + 1);
                    if (currentDate > nextMonth) {
                        // Завершение задачи и перевод на этап 4
                        await this.updateUserTask(user.userId, selectedTask.taskId, {
                            etaps: 4,
                        });

                        await this.updateTaskCompletion(user.userId, selectedTask.taskId, true);

                        return "Task completion status updated successfully";
                    } else {
                        throw new Error('Less than 24 days have passed since the last update.');
                    }
                } else {
                    throw new Error('Invalid dataSendCheck value.');
                }
            }
        }
    }

    async checkOpenUrlReg(user: User, selectedTask: UserTask) {
        if (IsOpenUrl(selectedTask.taskType)) {
            const currentDate = new Date();


            let {etaps, dataSendCheck} = selectedTask;

            // Если etaps или dataSendCheck равны null, считаем, что задача не начата
            if (etaps === null || dataSendCheck === null) {
                etaps = 0;
                dataSendCheck = currentDate.toISOString();
            }

            if (etaps === 0) {
                // Перевод на этап 1 и сохранение текущей даты
                await this.updateUserTask(user.userId, selectedTask.taskId, {
                    etaps: 1,
                    dataSendCheck: currentDate.toISOString(),
                });
                console.log("update is -")
                return "Task completion status updated successfully";

            } else if (etaps === 1) {
                // Проверка, прошло ли больше 24 часов с момента сохраненной даты
                if (dataSendCheck) {
                    const savedDate = new Date(dataSendCheck);
                    const nextDay = new Date(savedDate);
                    nextDay.setDate(savedDate.getDate() + 1);
                    console.error("nextDay - ", nextDay);
                    if (currentDate > nextDay) {
                        // Завершение задачи и перевод на этап 4
                        await this.updateUserTask(user.userId, selectedTask.taskId, {
                            completed: true,
                            etaps: 4,
                        });
                        return "Task completion status updated successfully";
                    } else {
                        throw new Error('Less than 24 hours have passed since the last update.');
                    }
                } else {
                    throw new Error('Invalid dataSendCheck value.');
                }
            }
        }
    }


    async updateUserTask(userId: string, taskId: number, updatedFields: Partial<UserTask>): Promise<void> {
        // Сначала проверяем, существует ли запись в userTasks
        const checkSql = `
            SELECT COUNT(*)
            FROM userTasks
            WHERE userId = ?
              AND taskId = ?
        `;
        const [rows] = await this.db.execute<RowDataPacket[]>(checkSql, [userId, taskId]);
        const taskExists = rows[0]['COUNT(*)'] > 0;

        // Если запись существует, обновляем её
        if (taskExists) {
            const fieldsToUpdate = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
            const values = Object.values(updatedFields);
            const updateSql = `
                UPDATE userTasks
                SET ${fieldsToUpdate}
                WHERE userId = ?
                  AND taskId = ?
            `;
            await this.db.execute(updateSql, [...values, userId, taskId]);
        } else {
            // Если записи нет, создаем её с переданными полями
            const fields = Object.keys(updatedFields).join(', ');
            const placeholders = Object.keys(updatedFields).map(() => '?').join(', ');
            const insertSql = `
                INSERT INTO userTasks (userId, taskId, ${fields})
                VALUES (?, ?, ${placeholders})
            `;
            const values = Object.values(updatedFields);
            await this.db.execute(insertSql, [userId, taskId, ...values]);
        }
    }


    async updateTaskCompletion(userId: string, taskId: number, completed: boolean, addedUserCoins: boolean = true): Promise<void> {
        const updateTaskSql = `
            UPDATE userTasks
            SET completed         = ?,
                lastCompletedDate = ?
            WHERE userId = ?
              AND taskId = ?
        `;
        const getTaskSql = `SELECT coins, type, rewards
                            FROM tasks
                            WHERE id = ?`;
        const updateUserCoinsSql = `UPDATE users
                                    SET coins = coins + ?
                                    WHERE userId = ?`;

        const today = new Date().toISOString().split('T')[0];
        const completedDate = completed ? today : null;

        try {
            // Get task details
            const [taskRows] = await this.db.execute<mysql.RowDataPacket[]>(getTaskSql, [taskId]);
            const task = taskRows[0] as Task;

            if (!task) {
                throw new Error('Task not found');
            }

            if (completed && task.type === 'DailyTask') {
                await this.db.execute(updateTaskSql, [1, completedDate, userId, taskId]);
            } else {
                await this.db.execute(updateTaskSql, [completed ? 1 : 0, completedDate, userId, taskId]);
            }

            if (completed) {
                let rewards: Rewards[] | string | undefined = task.rewards;
                try {
                    if (rewards) {
                        rewards = JSON.parse(rewards) as Rewards[];
                    }
                } catch (error) {
                    throw new Error("Failed to parse rewards");
                }
                console.log("rewards is task - ", rewards)
                if (rewards) {
                    for (const reward of rewards) {
                        console.log("rewards is task - ", reward)
                        if (typeof reward == "object") {
                            console.log("rewards is task - typeOfObject ")
                            const {tag, count} = reward;
                            if (reward.tag == "coins" && count) {
                                // const userController = new UserController(this.db)
                                await this.userService.addCoinsToUser(userId, count)
                            }

                        }
                    }
                }
                // Получаем максимальный уровень для кастомного предмета
                if (addedUserCoins) {
                    await this.db.execute(updateUserCoinsSql, [task.coins, userId]);
                }
            }
        } catch (error) {
            console.error('Error updating task completion:', error);
            throw new Error(`Failed to update task completion: ${error}`);
        }
    }


    async deleteTask(taskId: number): Promise<void> {
        try {
            // First, delete the associated entries in userTasks table
            const deleteUserTasksSql = `DELETE
                                        FROM userTasks
                                        WHERE taskId = ?`;
            await this.db.execute(deleteUserTasksSql, [taskId]);

            // Then, delete the task from tasks table
            const deleteTaskSql = `DELETE
                                   FROM tasks
                                   WHERE id = ?`;
            await this.db.execute(deleteTaskSql, [taskId]);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw new Error(`Failed to delete task: ${error}`);
        }
    }


    async getTaskById(taskId: number): Promise<TaskCardProps | undefined> {
        const taskSql = `SELECT *
                         FROM tasks
                         WHERE id = ?`;

        try {
            const [rows] = await this.db.execute<mysql.RowDataPacket[]>(taskSql, [taskId]);
            const task = rows[0];

            if (task) {
                return {
                    id: task.id,
                    text: task.text,
                    coins: task.coins,
                    checkIcon: task.checkIcon,
                    taskType: JSON.parse(task.taskType), // Парсинг taskType
                    type: task.type,
                    completed: false, // В таблице tasks нет поля completed, поэтому задаем значение false
                    actionBtnTx: task.actionBtnTx,
                    txDescription: task.txDescription,
                    completeLimit: task.completeLimit,
                    isVisible: task.isVisible,
                    completeCount: task.completeCount
                };
            }
        } catch (error) {
            console.error('Error fetching task:', error);
        }

        return undefined;
    }

    async updateTask(taskId: number, updatedFields: Partial<TaskCardProps>): Promise<void> {
        // Если taskType или rewards присутствуют в updatedFields, преобразуем их в JSON строку
        if (updatedFields.taskType) {
            updatedFields.taskType = JSON.stringify(updatedFields.taskType) as unknown as any;
        }

        if (updatedFields.rewards) {
            updatedFields.rewards = JSON.stringify(updatedFields.rewards) as unknown as any;
        }

        const fieldsToUpdate = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updatedFields);

        const updateTaskSql = `
            UPDATE tasks
            SET ${fieldsToUpdate}
            WHERE id = ?
        `;

        try {
            await this.db.execute(updateTaskSql, [...values, taskId]);
        } catch (error) {
            console.error('Error updating task:', error);
            throw new Error(`Failed to update task: ${error}`);
        }
    }


    async getAllTasks(): Promise<TaskCardProps[]> {
        const tasksSql = `
            SELECT id,
                   text,
                   coins,
                   checkIcon,
                   taskType,
                   type,
                   rewards,
                   actionBtnTx,
                   txDescription,
                   completeLimit,
                   completeCount,
                   isVisible
            FROM tasks
        `;

        const [rows] = await this.db.execute<mysql.RowDataPacket[]>(tasksSql);
        const tasks = rows;

        if (tasks) {
            return tasks.map(task => ({
                id: task.id,
                text: task.text,
                coins: task.coins,
                checkIcon: task.checkIcon,
                taskType: JSON.parse(task.taskType),
                type: task.type,
                rewards: task.rewards ? JSON.parse(task.rewards) : null, // Добавлено новое поле
                completed: false, // Default to false since these are all tasks, not user-specific
                actionBtnTx: task.actionBtnTx,
                txDescription: task.txDescription,
                completeLimit: task.completeLimit,
                completeCount: task.completeCount,
                isVisible: task.isVisible,
            }));
        } else {
            return [];
        }
    }

    async addTask(
        text: string,
        coins: number,
        checkIcon: string,
        taskType: TaskType,
        type: string,
        rewards: Rewards[] | null,
        isVisible: number,
        sortLocal?: string | null,
        actionBtnTx: string | null = null,
        txDescription: string | null = null,
        completeLimit: number | null = null,
    ): Promise<TaskCardProps> {
        // SQL-запрос для вставки новой задачи в таблицу `tasks`
        let insertTaskSql = `
            INSERT INTO tasks (text, coins, checkIcon, taskType, type, rewards, actionBtnTx, txDescription,
                               completeLimit, isVisible, sortLocal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {

            const [result] = await this.db.execute<mysql.OkPacket>(insertTaskSql, [
                text,
                coins,
                checkIcon,
                JSON.stringify(taskType), // Преобразуем taskType в JSON строку
                type,
                rewards ? JSON.stringify(rewards) : null, // Преобразуем rewards в JSON строку или null
                actionBtnTx, // Значения уже могут быть null по умолчанию
                txDescription, // Значения уже могут быть null по умолчанию
                completeLimit, // Уже установлено значение по умолчанию null
                isVisible,
                sortLocal
            ]);

            const newTaskId = result.insertId;

            if (newTaskId === undefined) {
                throw new Error('Failed to create new task');
            }

            // Создаем объект taskCardProps типа TaskCardProps
            const taskCardProps: TaskCardProps = {
                id: newTaskId,
                text,
                coins,
                checkIcon,
                completed: false,
                taskType,  // Убедитесь, что taskType соответствует типу TaskType
                type,
                rewards: rewards || [],  // Приводим к типу Rewards[], если null - используем пустой массив
                actionBtnTx,
                txDescription,
                completeLimit,
                completeCount: 0,
                isVisible,
                sortLocal
            };

            return taskCardProps;
        } catch (error) {
            console.error(`Error adding task: ${error}`);
            throw new Error(`Error adding task: ${error}`);
        }
    }

    async getTaskForUser(userId: string) {
        const userTasksSql = `
            SELECT t.id                      AS taskId,
                   t.text,
                   t.coins,
                   t.checkIcon,
                   t.taskType,
                   t.type,
                   COALESCE(ut.completed, 0) AS completed, -- Если задачи нет в userTasks, считается незавершенной
                   ut.lastCompletedDate,
                   ut.dataSendCheck,
                   ut.isLoading,
                   ut.etTx,
                   ut.etaps,
                   ut.storedValues,
                   t.rewards,
                   t.completeLimit,
                   t.completeCount,
                   t.isVisible,
                   t.sortLocal
            FROM tasks t
                     LEFT JOIN userTasks ut ON t.id = ut.taskId AND ut.userId = ?
        `;

        // Снова извлечем обновленные задачи
        let [rowUserTasksUpdate] = await this.db.execute(userTasksSql, [userId]);
        let userTasks = rowUserTasksUpdate as UserTaskFormated[]

        return await Promise.all(userTasks.map(async (task) => {
            return {
                taskId: task.taskId,
                text: task.text,
                coins: task.coins,
                checkIcon: task.checkIcon,
                taskType: JSON.parse(task.taskType),
                type: task.type,
                completed: task.completed === 1, // Convert 1 to true and 0 to false
                lastCompletedDate: task.lastCompletedDate,
                actionBtnTx: task.actionBtnTx,
                txDescription: task.txDescription,
                dataSendCheck: task.dataSendCheck,
                isLoading: task.isLoading === 1, // Convert 1 to true and 0 to false
                etTx: task.etTx,
                etaps: task.etaps,
                completeLimit: task.completeLimit,
                completeCount: task.completeCount,
                storedValues: task.storedValues ? JSON.parse(task.storedValues) : "",
                rewards: task.rewards ? JSON.parse(task.rewards) : null,
                isVisible: task.isVisible,
                sortLocal: task.sortLocal,
            };
        }));
    }

}

export default TaskService;