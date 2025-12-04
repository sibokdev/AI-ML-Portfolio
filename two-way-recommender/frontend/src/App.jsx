import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import ApplicantDashboard from './pages/ApplicantDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobsList from './pages/JobsList';
import CreateJob from './pages/CreateJob';
import Health from './pages/Health';
import ProfileView from './pages/ProfileView';
import { useTranslation } from 'react-i18next';

export default function App(){
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  React.useEffect(()=>{
    // redirect to login if no role
    const role = localStorage.getItem('role');
    if(!role) nav('/login');
  }, []);

  const switchLang = (lng)=> i18n.changeLanguage(lng);

  return (
    <div className="container">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('app_title')}</h1>
          <div className="small"> {t('language')}: 
            <select className="ml-2" onChange={(e)=>switchLang(e.target.value)} defaultValue="en">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        <nav className="flex gap-3">
          <button className="button" onClick={()=>nav('/jobs')}>{t('jobs')}</button>
          <button className="button" onClick={()=>nav('/create-job')}>{t('create_job')}</button>
          <button className="button" onClick={()=>nav('/health')}>{t('health')}</button>
          <button className="button" onClick={()=>{
            localStorage.removeItem('role'); localStorage.removeItem('user_id'); nav('/login');
          }}>{t('logout')}</button>
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/applicant/:id" element={<ApplicantDashboard/>} />
        <Route path="/recruiter/:id" element={<RecruiterDashboard/>} />
        <Route path="/jobs" element={<JobsList/>} />
        <Route path="/create-job" element={<CreateJob/>} />
        <Route path="/health" element={<Health/>} />
        <Route path="/profile/:id" element={<ProfileView/>} />
        <Route path="*" element={<Login/>} />
      </Routes>
    </div>
  );
}
