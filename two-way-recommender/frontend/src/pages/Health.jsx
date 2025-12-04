import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Health(){
  const [status, setStatus] = useState(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  useEffect(()=>{
    const fetch = async ()=> {
      try{ const res = await axios.get(API + '/health'); setStatus(res.data); } catch(err){ setStatus({error: err.message}); }
    };
    fetch();
  },[]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Health</h2>
      <div className="card">
        <pre>{JSON.stringify(status,null,2)}</pre>
      </div>
    </div>
  );
}
