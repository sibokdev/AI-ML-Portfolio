import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobCard({job, role, onGetRecs, onApply}) {
  const nav = useNavigate();
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{job.title}</h3>
      <p className="small">{job.description}</p>
      <div className="mt-2 flex gap-2 flex-wrap">
        {job.skills?.map((s,i)=><span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded-full">{s}</span>)}
      </div>
      <div className="mt-3 flex gap-2">
        {role === 'recruiter' ? (
          <>
            <button className="button" onClick={()=>onGetRecs && onGetRecs(job)} disabled={!job.vector_id}>Get candidates</button>
            <button className="button" onClick={()=>{ navigator.clipboard.writeText(job.id); alert('Job id copied'); }}>Copy ID</button>
          </>
        ) : (
          <>
            <button className="button" onClick={()=>onApply && onApply(job)}>{'Apply'}</button>
            <button className="button" onClick={()=>{ navigator.clipboard.writeText(job.id); alert('Job id copied'); }}>Copy ID</button>
          </>
        )}
      </div>
    </div>
  );
}
