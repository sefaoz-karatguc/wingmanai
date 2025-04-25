import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "./Locales/en";
import trLang from "./Locales/tr";
import * as RNLocalize from "react-native-localize";

// Async fonksiyon içinde init işlemi
const initI18n = async () => {
  const lang = RNLocalize.getLocales()[0].languageCode || "en";

  i18n.use(initReactI18next).init({
    resources: {
      tr: { translation: trLang },
      en: { translation: enLang },
    },
    lng: lang,
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
