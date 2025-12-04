import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ApplicantDashboard(){
  const [cvText, setCvText] = useState('');
  const [file, setFile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [avg, setAvg] = useState(0);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const user_id = localStorage.getItem('user_id') || 'demo_candidate';

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axios.get(API + `/dashboard/applicant/${user_id}`);
        setSuggestions(res.data.recommendations || []);
        setFavorites(res.data.favorites || []);
        setAvg(res.data.avg_match_rate || 0);
      }catch(err){ console.error(err); }
    };
    fetch();
  },[]);

  const uploadText = async (e)=>{
    e.preventDefault();
    try{
      const res = await axios.post(API + '/candidates/index_cv', { cv_text: cvText, name: 'Demo Candidate' });
      alert('Indexed: ' + JSON.stringify(res.data.candidate));
    }catch(err){ alert('Error: ' + (err?.response?.data || err.message)); }
  };

  const uploadFile = async (e)=>{
    e.preventDefault();
    if(!file) return alert('Select file first');
    const form = new FormData();
    form.append('file', file);
    // name in form is optional
    try{
      const res = await axios.post(API + '/candidates/index_cv', form, { headers: {'Content-Type':'multipart/form-data'} });
      alert('Indexed file: ' + JSON.stringify(res.data.candidate));
    }catch(err){ alert('Error: ' + (err?.response?.data || err.message)); }
  };

  const getJobSuggestions = async ()=>{
    try{
      const res = await axios.post(API + '/recommend/jobs_for_cv', { cv_text: cvText, topk: 6 });
      setSuggestions(res.data.results || []);
    }catch(err){ alert('Error: ' + (err?.response?.data || err.message)); }
  };

  const sendJobFeedback = async ({job_id, rating, comments})=>{
    try{
      const res = await axios.post(API + '/feedback/job', { user_id, job_id, rating, comments });
      alert('Feedback sent');
    }catch(err){ alert('Error: ' + (err?.response?.data || err.message)); }
  };

  const favoriteJob = async (job_id)=>{
    try{
      const res = await axios.post(API + `/jobs/${job_id}/favorite`, { user_id });
      alert('Favorited');
    }catch(err){ alert('Error'); }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Applicant Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Upload CV (text)</h3>
          <form onSubmit={uploadText} className="flex flex-col gap-2">
            <textarea className="input" rows={6} value={cvText} onChange={e=>setCvText(e.target.value)} placeholder="Paste CV text here..." />
            <div className="flex gap-2">
              <button className="button" type="submit">Index CV</button>
              <button className="button" type="button" onClick={getJobSuggestions}>Get job suggestions</button>
            </div>
          </form>

          <h4 className="mt-4 font-semibold">Or upload file</h4>
          <form onSubmit={uploadFile} className="flex flex-col gap-2">
            <input type="file" onChange={e=>setFile(e.target.files[0])} />
            <button className="button" type="submit">Upload file</button>
          </form>
        </div>

        <div>
          <div className="card mb-4">
            <strong>Avg match rate:</strong> {avg}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">Favorites</h3>
            {favorites.length===0 ? <div className="small">No favorites</div> : favorites.map(f=>(
              <div key={f.id} className="p-2 border-b">{f.title}</div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-3">Suggested Jobs</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.length===0 && <div className="card">No suggestions</div>}
        {suggestions.map((s,i)=>(
          <div key={i} className="card">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{s.job?.title}</div>
                <div className="small">{s.job?.description}</div>
              </div>
              <div className="text-right small">Score: {s.score}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="button" onClick={()=>favoriteJob(s.job.get('id') || s.job?.id || '')}>Favorite</button>
              <button className="button" onClick={()=>sendJobFeedback({job_id: s.job?.id, rating: 5, comments: 'Good match'})}>Rate 5</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
