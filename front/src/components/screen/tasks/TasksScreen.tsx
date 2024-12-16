import React, {useEffect, useRef, useState} from "react";
import colors, {OpenUrl, useTelegramBackButton} from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import icCoins from "../../../assets/ico/ic_coins.svg";
import {useData} from "../../coreComponents/DataContext.tsx";
import {UserTask} from "../../coreComponents/types/UserType.ts";
import {useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import {checkSuccessTask, getTaskForUser} from "../../coreComponents/remoteWorks/UserRemote.ts";
import {
    CheckNftTask,
    IsDaysChallengeTask,
    isOpenUrlTask, IsSampleTask,
    IsStockReg, isStockTrTask,
    IsTransferToneTask, StockRegTask
} from "../../coreComponents/types/TaskType.ts";
import {Address, beginCell, toNano} from "ton-core";
import {ModalQuestsMulti} from "../../modal/taskModal/TaskModal.tsx";
import {ButtonMain} from "../../viewComponents/buttonMain/ButtonMain.tsx";
import Progressbar from "../../viewComponents/progressbar/Progressbar.tsx";
import {useToast} from "../../viewComponents/Toast.tsx";
import {HorizontalSelector} from "../../viewComponents/selector/HorizontalSelector.tsx";
import {useTranslation} from "react-i18next";

export const TasksScreen: React.FC = () => {

    const navigate = useNavigate();


    const {dataApp} = useData();
    // const [tabSelected, setTabSelected] = useState<string>("Task");
    const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
    const [visitTask, setVisitTask] = useState<boolean>(false);
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [userLanguage, setUserLanguage] = useState<string>('');
    const [tasks, setTasks] = useState<UserTask[]>([])
    const [loading, setLoading] = useState(false);
    const hasFetchedData = useRef(false);
    const [tabSelected, setTabSelected] = useState<string>("Task");

    const {t} = useTranslation()

    useEffect(() => {
        // Получаем основной язык пользователя
        const language = navigator.language || navigator.languages[0];

        const primaryLanguage = language.split('-')[0];

        // Устанавливаем язык в состояние компонента
        setUserLanguage(primaryLanguage);
        console.log("userLanguage - ",primaryLanguage, userLanguage)
    }, []);
    try {
        useTelegramBackButton(true)
    } catch (e) {
        console.log("error in postEvent - ", e)
    }

    const handleTabSelect = (selectedTab: string) => {
        console.log(`Selected tab: ${tabSelected}`);
        setTabSelected(selectedTab)
    };

    const {showToast} = useToast();

    const handleShowToast = (message: string, type: 'success' | 'error' | 'info') => {
        showToast(message, type);
    };

    // const handleTabSelect = (selectedTab: string) => {
    //     console.log(`Selected tab: ${tabSelected}`);
    //     setTabSelected(selectedTab)
    // };

    const openBottomSheet = (task: UserTask) => {
        if (!task.completed) {
            setSelectedTask(task);
            setBottomSheetVisible(true);
        }
    };

    const closeBottomSheet = () => {
        setTaskStates({})
        setBottomSheetVisible(false);
        setVisitTask(false)
    };


    const getTasks = async () => {
        const result = await getTaskForUser()
        if(typeof result == "object") {
            setTasks(result)
        }
    }

    useEffect(() => {
        if (!hasFetchedData.current) {
            setLoading(true)
            getTasks().finally(() => {
                hasFetchedData.current = true
                setLoading(false)
            })
        }
    }, []);


    const handleNav = (marsh: string) => {
        navigate(`/${marsh}`);
    };

    // Создание состояния для хранения статусов задач
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [taskStates, setTaskStates] = useState<Record<number, {
        isLoading: boolean;
        checkResult: boolean | null;
        errorMessage: string | null;
    }>>({})

    const updateTaskState = (taskId: number, newState: Partial<typeof taskStates[number]>) => {
        setTaskStates(prevStates => ({
            ...prevStates,
            [taskId]: {
                ...prevStates[taskId],
                ...newState,
            }
        }));
    };

    const checkTask = async () => {
        const SselectedTask = selectedTask;
        if (SselectedTask != undefined) {
            try {
                updateTaskState(SselectedTask.taskId, {isLoading: true});
                const requestToCheck = await checkSuccessTask(SselectedTask.taskId)
                if (typeof requestToCheck === 'object') {
                    setTasks(requestToCheck)
                    // setDataApp(requestToCheck);
                    if (IsStockReg(SselectedTask.taskType)) {
                        if (SselectedTask.etaps == 0 || SselectedTask.etaps == 2) {
                            handleShowToast("Your task has been sent for verification", 'info')
                        } else {
                            handleShowToast("The checking was successful", 'success')
                        }
                    } else if (isOpenUrlTask(SselectedTask.taskType)) {
                        if (SselectedTask.etaps == 0 || SselectedTask.etaps == 2) {
                            handleShowToast("Your task has been sent for verification", 'info')
                        } else {
                            handleShowToast("The checking was successful", 'success')
                        }
                    } else {
                        handleShowToast("The checking was successful", 'success')
                    }
                    closeBottomSheet()
                } else {
                    handleShowToast("You didn't fulfil the conditions ", 'error')
                }
            } catch (e) {
                console.log(e)
                handleShowToast("You didn't fulfil the conditions ", 'error')
            } finally {
                updateTaskState(SselectedTask.taskId, {isLoading: false});
            }

        }
    }


    const SendTransactions = async () => {
        if (selectedTask != null) {
            if (IsTransferToneTask(selectedTask.taskType) || IsDaysChallengeTask(selectedTask.taskType)) {
                const amount = selectedTask.taskType.price
                const address = selectedTask.taskType.addressToTransfer
                const body = beginCell()
                    .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
                    .storeStringTail(dataApp.userId) // write our text comment
                    .endCell()
                const transaction = {
                    validUntil: Date.now() + 1000000,
                    messages: [
                        {
                            address: address,
                            amount: toNano(amount).toString(),
                            payload: body.toBoc().toString("base64") // payload with comment in body
                        },
                    ]
                }
                try {
                    const addressWallet = wallet?.account?.address ? Address.parse(wallet?.account?.address as string) : undefined;
                    if (addressWallet == undefined) {
                        tonConnectUI.modal.open()
                    } else {

                        await tonConnectUI.sendTransaction(transaction)
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }

    }


    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh',
                position: 'relative',
                overflowX: 'hidden',
                background: colors.black,
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
            }}
        >

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    flexDirection: 'column',
                    alignContent: 'center',
                    width: '100%',
                    paddingBottom: `${60}px`, // Отступ для учета док-бара
                }}
            >
       <span style={{
           color: colors.pink,
           textAlign: 'center',
           fontFamily: "UbuntuBold",
           fontSize: '24px',
           marginTop: '48px',
       }}>
                {t('tasks.tasks')}
            </span>

                <span style={{
                    color: colors.white,
                    textAlign: 'center',
                    fontFamily: "UbuntuMedium",
                    fontSize: '16px',
                    marginTop: '16px',
                    paddingLeft: '12px',
                    paddingRight: '12px'
                }}>
                {t('tasks.completed_task')}
            </span>


                <HorizontalSelector tabs={["Task", "Quests", "Dex"]} onTabSelect={handleTabSelect}/>

                {tabSelected === "Task" && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingRight: '16px',
                        paddingLeft: '16px',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                        {tasks.map((item) => {


                            if (item.completed || item.type != "Task") {
                                return null;
                            }


                            if (typeof item.sortLocal == "string") {
                                if (item.sortLocal != "" || userLanguage != "") {
                                    if (item.sortLocal != userLanguage) {
                                        return null;
                                    }
                                }
                            }

                            return (
                                <TaskItem
                                    key={item.taskId}
                                    name={item.text}
                                    image={item.checkIcon}
                                    price={item.coins}
                                    handleClick={() => openBottomSheet(item)}
                                />
                            )

                        })}
                    </div>
                )}

                {tabSelected === "Quests" && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingRight: '16px',
                        paddingLeft: '16px',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                        {tasks.map((item) => {


                            if (item.completed || item.type != "Quests") {
                                return null;
                            }
                            if (typeof item.sortLocal == "string") {
                                if (item.sortLocal != "" || userLanguage != "") {
                                    if (item.sortLocal != userLanguage) {
                                        return null;
                                    }
                                }
                            }

                            return (
                                <TaskItem
                                    key={item.taskId}
                                    name={item.text}
                                    image={item.checkIcon}
                                    price={item.coins}
                                    handleClick={() => openBottomSheet(item)}
                                />
                            )

                        })}
                    </div>
                )}

                {tabSelected === "Dex" && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingRight: '16px',
                        paddingLeft: '16px',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                        {tasks.map((item) => {


                            if (item.completed || item.type != "Dex") {
                                return null;
                            }
                            if (typeof item.sortLocal == "string") {
                                if (item.sortLocal != "" || userLanguage != "") {
                                    if (item.sortLocal != userLanguage) {
                                        return null;
                                    }
                                }
                            }

                            return (
                                <TaskItem
                                    key={item.taskId}
                                    name={item.text}
                                    image={item.checkIcon}
                                    price={item.coins}
                                    handleClick={() => openBottomSheet(item)}
                                />
                            )

                        })}
                    </div>
                )}

            </div>

            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>


                <DownDockBar initialSelected={"Tasks"} onPredictionsClick={() => {
                    navigate('/predictions')
                }} onProfileClick={() => {
                    navigate('/profile')
                }} onAirDropClick={() => {
                    navigate('/airDrop')
                }} onReferralsClick={() => {
                    navigate('/referrals')
                }} onTasksClick={() => {
                }}/>
            </div>


            {selectedTask && (
                <ModalQuestsMulti isVisible={isBottomSheetVisible}
                                  onClose={closeBottomSheet}
                                  img={selectedTask.checkIcon}
                                  title={selectedTask.text}
                                  description={selectedTask.txDescription}
                                  reward={selectedTask.rewards != null ? selectedTask.rewards[0] : null}
                                  content={
                                      <div style={{
                                          width: '100%',
                                          boxSizing: 'border-box',
                                          marginLeft: '16px',
                                          marginRight: '16px'
                                      }}>
                                          <ButtonMain
                                              tx={visitTask ? taskStates[selectedTask.taskId]?.isLoading ? 'Checking' : 'Check Task' : 'Complete Task'}
                                              onClick={() => {
                                                  if (visitTask) {
                                                      checkTask()
                                                  } else {
                                                      if (selectedTask?.taskType != undefined) {
                                                          if (isOpenUrlTask(selectedTask.taskType)) {
                                                              OpenUrl(selectedTask.taskType.url)
                                                          }
                                                          if (CheckNftTask(selectedTask.taskType)) {
                                                              OpenUrl(`https://getgems.io/collection/${(selectedTask.taskType as CheckNftTask).checkCollectionsAddress}`)
                                                          }
                                                          if (IsStockReg(selectedTask.taskType)) {
                                                              OpenUrl(`${(selectedTask.taskType as StockRegTask).url}`);
                                                          }
                                                          // if(IsInternalChallengeTask(selectedTask.taskType)) {
                                                          //     handleNav('airDrop');
                                                          // }

                                                          if (IsTransferToneTask(selectedTask.taskType)) {
                                                              SendTransactions()
                                                          }

                                                          if (IsSampleTask(selectedTask.taskType)) {
                                                              handleNav('airDrop');
                                                          }

                                                          if (IsDaysChallengeTask(selectedTask.taskType)) {
                                                              SendTransactions()
                                                          }
                                                          if (isStockTrTask(selectedTask.taskType)) {
                                                              OpenUrl(selectedTask.taskType.url)
                                                          }
                                                      }
                                                      setVisitTask(true)
                                                  }
                                              }}
                                              // onLoading={taskStates[selectedTask.taskId]?.isLoading}
                                          />
                                      </div>
                                  }
                />
            )}
            {loading && <Progressbar bgIsV={true}/>}
        </div>
    )
}

interface TaskItemParam {
    image: string;
    name: string;
    price: number;
    handleClick: () => void;
}

export const TaskItem: React.FC<TaskItemParam> = ({image, name, price, handleClick}) => {

    return (
        <div
            style={{
                backgroundColor: '#fff',
            padding: '20px 30px',
            borderRadius: '15px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginTop: '16px',
            width: 'calc(100% - 48px)',
            position: 'relative',
        }} onClick={handleClick}
        >

            <div style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '6px'
            }}>

                <img src={image} style={{
                    width: '32px',
                    height: '32px',
                }}/>

                <span style={{
                    fontSize: '16px',
                    fontFamily: "UbuntuBold",
                }}>
                            {name}
                        </span>
            </div>


            <div style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '6px'
            }}>


            <span style={{
                color: colors.black,
                fontSize: '20px',
                fontFamily: "UbuntuBold",
            }}>
                          {price}
                        </span>

                <img src={icCoins} style={{
                    width: '32px',
                    height: '32px',
                    filter: 'brightness(0) saturate(100%) invert(61%) sepia(72%) saturate(157%) hue-rotate(296deg) brightness(95%) contrast(102%)'
                }}/>
            </div>


        </div>
    )
}