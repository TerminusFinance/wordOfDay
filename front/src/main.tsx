import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {SDKProvider} from "@telegram-apps/sdk-react";
import {TonConnectUIProvider} from "@tonconnect/ui-react";
import './components/coreComponents/translations/i18n.ts';
const manifestUrl = 'https://shuriginadiana.net/api/manifest';


createRoot(document.getElementById('root')!).render(
    <SDKProvider acceptCustomStyles debug>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </TonConnectUIProvider>
    </SDKProvider>
)