import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

export default function JobsList(){
  const [jobs, setJobs] = useState([]);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axios.get(API + '/jobs/search?q=');
        setJobs(res.data.results || []);
      }catch(err){ console.error(err); }
    };
    fetch();
  },[]);

  const role = localStorage.getItem('role') || 'applicant';

  const onGetRecs = (job)=> {
    // open recruiter dashboard for job recommendations
    window.location.href = `/recruiter/demo_recruiter?focus=${job.id}`;
  };

  const onApply = async (job)=>{
    alert('To apply, upload CV from your applicant dashboard and reference job id: ' + job.id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Jobs</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map(j=> <JobCard key={j.id} job={j} role={role} onGetRecs={onGetRecs} onApply={onApply} />)}
      </div>
    </div>
  );
}
