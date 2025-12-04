import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ProfileView(){
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(()=>{
    // try to find profile in candidates list (no endpoint for single profile in backend)
    const fetch = async ()=>{
      try{
        const res = await axios.get(API + '/health'); // placeholder
        setProfile({id, phone: 'N/A', name: id});
      }catch(err){ setProfile({id, name: id}); }
    };
    fetch();
  },[id]);

  if(!profile) return <div>Loading...</div>;
  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Profile {profile.name}</h2>
      <pre>{JSON.stringify(profile,null,2)}</pre>
    </div>
  );
}
