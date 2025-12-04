import React, { useState } from 'react';
import axios from 'axios';

export default function CreateJob(){
  const [title,setTitle]=useState(''); const [desc,setDesc]=useState(''); const [skills,setSkills]=useState('');
  const [resp,setResp]=useState(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const submit = async (e)=>{
    e.preventDefault();
    try{
      const res = await axios.post(API + '/jobs', { title, description: desc, skills: skills.split(',').map(s=>s.trim()), recruiter_id: localStorage.getItem('user_id') || 'demo_recruiter' });
      setResp(res.data.job);
    }catch(err){ setResp({error: err?.response?.data || err.message}); }
  };

  return (
    <div className="max-w-2xl">
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Create Job</h2>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <input className="input" placeholder="Skills, comma separated" value={skills} onChange={e=>setSkills(e.target.value)} />
          <button className="button" type="submit">Create</button>
        </form>
        {resp && <pre className="mt-3">{JSON.stringify(resp,null,2)}</pre>}
      </div>
    </div>
  );
}
