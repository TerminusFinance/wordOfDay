import './App.css'
import {initSwipeBehavior, postEvent} from "@telegram-apps/sdk";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {DataProvider} from "./components/coreComponents/DataContext.tsx";
import {PredictionsScreen} from "./components/screen/predictions/PredictionsScreen.tsx";
import {LoadingScreen} from "./components/screen/loading/LoadingScreen.tsx";
import {AirDropScreen} from "./components/screen/airDrop/AirDropScreen.tsx";
import {ReferralsScreen} from "./components/screen/referrals/ReferralsScreen.tsx";
import {TasksScreen} from "./components/screen/tasks/TasksScreen.tsx";
import {ProfileScreen} from "./components/screen/profile/ProfileScreen.tsx";
import {StartScreen} from "./components/screen/start/StartScreen.tsx";
import {InitDataScreen} from "./components/screen/initData/InitDataScreen.tsx";

function App() {



  try {
    postEvent('web_app_expand');
    try {
      const [swipeBehavior] = initSwipeBehavior();
      swipeBehavior.disableVerticalSwipe();
    } catch (e) {
      console.log("change behavor - err", e)
    }
  }catch (e) {
    console.log("change theme - err", e)
  }

  return (
    <div className="app-container">
      <DataProvider>
        {/*<ToastProvider>*/}
          <Router >
            <Routes>
                <Route path={'/'} element={<LoadingScreen/>}/>
                <Route path={"/start"} element={<StartScreen/>}/>
                <Route path={"/initData"} element={<InitDataScreen/>}/>
                <Route path={'/predictions'} element={<PredictionsScreen/>}/>
                <Route path={'/airDrop'} element={<AirDropScreen/>}/>
                <Route path={'/referrals'} element={<ReferralsScreen/>}/>
                <Route path={'/tasks'} element={<TasksScreen/>}/>
                <Route path={'/profile'} element={<ProfileScreen/>}/>
            </Routes>
          </Router>
        {/*</ToastProvider>*/}
      </DataProvider>
    </div>

  )
}

export default App
