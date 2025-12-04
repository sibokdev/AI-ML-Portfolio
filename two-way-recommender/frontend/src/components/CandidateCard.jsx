import React from 'react';
import { useNavigate } from 'react-router-dom';
import Rating from './Rating';

export default function CandidateCard({cand, recruiter_id, onRate, onViewProfile}) {
  const nav = useNavigate();
  return (
    <div className="card">
      <div className="flex justify-between">
        <div>
          <h4 className="font-semibold">{cand.candidate?.name || cand.candidate?.id || 'Candidate'}</h4>
          <div className="small">{cand.candidate?.skills?.join(', ') || 'N/A'}</div>
        </div>
        <div className="text-right">
          <div className="small">Score: {cand.score}</div>
          <div className="mt-2">
            <button className="button" onClick={()=>onViewProfile && onViewProfile(cand)}>View profile</button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Rating value={0} onChange={(v)=> onRate && onRate({profile_id: cand.vector_id, job_id: cand.job_id, recruiter_id, rating: v})} />
        <button className="button" onClick={()=>alert('Contact: ' + (cand.candidate?.phone || 'N/A'))}>Call</button>
      </div>
    </div>
  );
}
