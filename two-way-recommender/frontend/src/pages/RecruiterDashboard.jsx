import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';
import CandidateCard from '../components/CandidateCard';
import { useSearchParams } from 'react-router-dom';

export default function RecruiterDashboard(){
  const [jobs, setJobs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const recruiter_id = localStorage.getItem('user_id') || 'demo_recruiter';
  const [params] = useSearchParams();

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const all = await axios.get(API + '/jobs/search?q=');
        setJobs(all.data.results || []);
        // try dashboard endpoint for suggestions
        const dash = await axios.get(API + `/dashboard/recruiter/${recruiter_id}`);
        setSuggestions(dash.data.suggestions || []);
      }catch(err){ console.error(err); }
      finally{ setLoading(false); }
    };
    fetch();
  },[]);

  const getCandidatesForJob = async (job)=>{
    if(!job.vector_id) return alert('No vector id');
    try{
      const res = await axios.post(API + '/recommend/candidates_for_job', { job_vector_id: job.vector_id, topk:6 });
      setSuggestions(res.data.results || []);
    }catch(err){ alert('Error: ' + (err?.response?.data || err.message)); }
  };

  const rateProfile = async ({profile_id, job_id, recruiter_id, rating})=>{
    try{
      const res = await axios.post(API + '/feedback/profile', { recruiter_id, profile_id, job_id, rating, comments: '' });
      alert('Profile feedback sent');
    }catch(err){ alert('Error'); }
  };

  const viewProfile = (cand)=> {
    // open profile modal or navigate
    setSelectedProfile(cand.candidate || {});
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Recruiter Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Your Jobs</h3>
          <div className="space-y-3">
            {jobs.map(j=> <JobCard key={j.id} job={j} role="recruiter" onGetRecs={getCandidatesForJob} />)}
            {jobs.length===0 && <div className="card">No jobs yet</div>}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Candidate Suggestions</h3>
          <div className="space-y-3">
            {suggestions.length===0 && <div className="card">No suggestions</div>}
            {suggestions.map((s,i)=> <CandidateCard key={i} cand={s} recruiter_id={recruiter_id} onRate={rateProfile} onViewProfile={viewProfile} />)}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="card max-w-lg">
            <h3 className="font-semibold">Profile details</h3>
            <pre>{JSON.stringify(selectedProfile,null,2)}</pre>
            <div className="mt-3 flex gap-2">
              <a className="button" href={"tel:" + (selectedProfile.phone || '')}>Call</a>
              <button className="button" onClick={()=>setSelectedProfile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
