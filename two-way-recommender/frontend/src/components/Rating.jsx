import React from 'react';

export default function Rating({value=0, onChange}) {
  const stars = [1,2,3,4,5];
  return (
    <div className="flex items-center">
      {stars.map(s=>(
        <button key={s} onClick={()=>onChange && onChange(s)} className="px-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={s<=value ? 'gold' : 'none'} stroke="currentColor" strokeWidth="1.5" className="text-yellow-500">
            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.845L19.335 24 12 20.201 4.665 24 6 15.593 0 9.748l8.332-1.73z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}
