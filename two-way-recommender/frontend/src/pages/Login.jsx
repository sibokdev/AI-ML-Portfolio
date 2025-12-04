import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Login(){
  const [role, setRole] = useState('applicant');
  const [userId, setUserId] = useState('');
  const nav = useNavigate();
  const { t } = useTranslation();

  const submit = (e)=>{
    e.preventDefault();
    const id = userId || (role==='applicant' ? 'demo_candidate' : 'demo_recruiter');
    localStorage.setItem('role', role);
    localStorage.setItem('user_id', id);
    nav(`/${role}/${id}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">{t('login')}</h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="small">{t('select_role')}</label>
          <select className="input" value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="applicant">{t('applicant')}</option>
            <option value="recruiter">{t('recruiter')}</option>
          </select>
          <label className="small">User ID (optional)</label>
          <input className="input" value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="demo_candidate or demo_recruiter" />
          <button className="button" type="submit">{t('submit')}</button>
        </form>
      </div>
    </div>
  );
}
