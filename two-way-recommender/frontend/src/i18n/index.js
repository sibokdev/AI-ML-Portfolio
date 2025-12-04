import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    "app_title":"Two Way Reecommender",
    "login":"Login",
    "select_role":"Select role",
    "applicant":"Applicant",
    "recruiter":"Recruiter",
    "jobs":"Jobs",
    "get_recommendations":"Get recommendations",
    "upload_cv":"Upload CV (text or file)",
    "apply":"Apply",
    "favorites":"Favorites",
    "create_job":"Create Job",
    "submit":"Submit",
    "logout":"Logout",
    "view_profile":"View profile",
    "rating":"Rating",
    "health":"Health",
    "language":"Language"
  }},
  es: { translation: {
    "app_title":"Recomendador Bidireccional",
    "login":"Iniciar sesión",
    "select_role":"Selecciona rol",
    "applicant":"Candidato",
    "recruiter":"Reclutador",
    "jobs":"Puestos",
    "get_recommendations":"Obtener recomendaciones",
    "upload_cv":"Subir CV (texto o archivo)",
    "apply":"Postular",
    "favorites":"Favoritos",
    "create_job":"Crear puesto",
    "submit":"Enviar",
    "logout":"Cerrar sesión",
    "view_profile":"Ver perfil",
    "rating":"Calificación",
    "health":"Salud",
    "language":"Idioma"
  }}
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
