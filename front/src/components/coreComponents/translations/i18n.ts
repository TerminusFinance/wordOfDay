import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './json/en.json';
import ru from './json/ru.json';

export const saveLanguageState = (languageState: string) => {
    try {
        localStorage.setItem('languageAppKey', languageState);
    } catch (err) {
        console.error(`saveLanguageState error: ${err}`);
    }
};

export const getLanguageState = (): string | null => {
    try {
        const languageState = localStorage.getItem('languageAppKey');
        if (languageState === null || languageState === undefined) {
            return null;
        } else {
            return languageState;
        }
    } catch (err) {
        console.error(`getLanguageState error: ${err}`);
        return null;
    }
};

const resources = {
    en: { translation: en },
    ru: { translation: ru },
};

const getLocales = (): string => {
    const localState = getLanguageState();
    if (localState == null) {
        const localizeResult = navigator.language.split('-')[0]; // Получение кода языка из браузера
        saveLanguageState(localizeResult);
        return localizeResult;
    } else {
        return localState;
    }
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        lng: getLocales(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v3',
    });

export default i18n;

export const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
};