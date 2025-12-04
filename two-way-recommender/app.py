
import os, json, uuid, numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict, Counter
from pysondb import db
from sentence_transformers import SentenceTransformer
import faiss

APP_PORT = int(os.getenv("PORT", 8000))
DATA_DIR = os.getenv("DATA_DIR", "./data")
os.makedirs(DATA_DIR, exist_ok=True)

embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
VEC_DIM = embedder.get_sentence_embedding_dimension()

jobs_db = db.getDb(os.path.join(DATA_DIR, "jobs.json"))
candidates_db = db.getDb(os.path.join(DATA_DIR, "candidates.json"))

feedback_db = {"job_ratings": [], "profile_ratings": []}
job_scores = defaultdict(list)
profile_scores = defaultdict(list)
FAVORITE_JOBS = {}
FAVORITE_PROFILES = {}

def to_vec(text):
    vec = embedder.encode([text])[0].astype("float32")
    norm = np.linalg.norm(vec)+1e-12
    return (vec/norm).astype("float32")

JOB_INDEX_PATH = os.path.join(DATA_DIR, "job_index.faiss")
CAND_INDEX_PATH = os.path.join(DATA_DIR, "candidate_index.faiss")
JOB_META_PATH = os.path.join(DATA_DIR, "job_meta.json")
CAND_META_PATH = os.path.join(DATA_DIR, "candidate_meta.json")

def load_index(path, dim):
    if os.path.exists(path):
        try:
            return faiss.read_index(path)
        except:
            return faiss.IndexFlatIP(dim)
    return faiss.IndexFlatIP(dim)

def load_meta(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_meta(obj, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

job_index = load_index(JOB_INDEX_PATH, VEC_DIM)
cand_index = load_index(CAND_INDEX_PATH, VEC_DIM)
job_meta = load_meta(JOB_META_PATH)
cand_meta = load_meta(CAND_META_PATH)

def add_job_vector(payload, job_record):
    vec = to_vec(payload)
    job_index.add(vec.reshape(1,-1))
    vid = uuid.uuid4().hex
    job_meta[vid] = job_record
    save_meta(job_meta, JOB_META_PATH)
    faiss.write_index(job_index, JOB_INDEX_PATH)
    return vid

def add_cand_vector(payload, cand_record):
    vec = to_vec(payload)
    cand_index.add(vec.reshape(1,-1))
    vid = uuid.uuid4().hex
    cand_meta[vid] = cand_record
    save_meta(cand_meta, CAND_META_PATH)
    faiss.write_index(cand_index, CAND_INDEX_PATH)
    return vid

def search_jobs_vector(query, topk=10):
    if job_index.ntotal == 0:
        return []
    qv = to_vec(query)
    D,I = job_index.search(qv.reshape(1,-1), topk)
    results=[]
    keys=list(job_meta.keys())
    for score, idx in zip(D[0].tolist(), I[0].tolist()):
        if idx<0 or idx>=len(keys): continue
        vid = keys[idx]
        results.append({"score": round(float(score),4), "vector_id": vid, "job": job_meta.get(vid,{})})
    return results

def search_cands_from_vec(vec, topk=10):
    if cand_index.ntotal == 0:
        return []
    D,I = cand_index.search(vec.reshape(1,-1), topk)
    results=[]
    keys=list(cand_meta.keys())
    for score, idx in zip(D[0].tolist(), I[0].tolist()):
        if idx<0 or idx>=len(keys): continue
        vid = keys[idx]
        results.append({"score": round(float(score),4), "vector_id": vid, "candidate": cand_meta.get(vid,{})})
    return results

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return {"status":"ok","jobs":job_index.ntotal,"candidates":cand_index.ntotal}

@app.post("/jobs")
def create_job():
    data = request.get_json(force=True)
    title = (data.get("title") or "").strip()
    desc = (data.get("description") or "").strip()
    skills = data.get("skills") or []
    if not title or not desc:
        return jsonify({"error":"title and description required"}), 400
    record = {"id": uuid.uuid4().hex, "title": title, "description": desc, "skills": skills, "recruiter_id": data.get("recruiter_id")}
    payload = f"{title}\\n{desc}\\nskills:{' '.join(skills)}"
    vid = add_job_vector(payload, record)
    record["vector_id"] = vid
    jobs_db.add(record)
    return jsonify({"job": record})

@app.get("/jobs/search")
def jobs_search():
    q = (request.args.get("q") or "").lower()
    res=[]
    for j in jobs_db.getAll():
        if q in (j.get("title","")+j.get("description","")).lower() or any(q in s for s in j.get("skills",[])):
            res.append(j)
    return jsonify({"results": res})

@app.post("/candidates/index_cv")
def index_cv():
    cv_text=None
    if "file" in request.files:
        file = request.files["file"]
        cv_text = file.read().decode("utf-8", errors="ignore")
    else:
        data = request.get_json(silent=True) or {}
        cv_text = data.get("cv_text")
    if not cv_text:
        return jsonify({"error":"CV required"}), 400
    skills = []  # lightweight; real extraction can be added
    rec = {"id": uuid.uuid4().hex, "name": data.get("name") if (data:=request.form or {}) else None, "email": None, "skills": skills}
    vid = add_cand_vector(cv_text, rec)
    rec["vector_id"]=vid
    candidates_db.add(rec)
    return jsonify({"candidate": rec})


@app.route('/feedback/job', methods=['POST'])
def feedback_job():
    data = request.json
    user_id = data.get("user_id")
    job_id = data.get("job_id")
    rating = data.get("rating")
    comments = data.get("comments", "")

    if not user_id or not job_id or rating is None:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    feedback_entry = {
        "user_id": user_id,
        "job_id": job_id,
        "rating": rating,
        "comments": comments
    }
    feedback_db["job_ratings"].append(feedback_entry)
    job_scores[job_id].append(rating)

    return jsonify({"message": "Feedback de trabajo recibido", "data": feedback_entry}), 201

@app.route('/feedback/profile', methods=['POST'])
def feedback_profile():
    data = request.json
    recruiter_id = data.get("recruiter_id")
    profile_id = data.get("profile_id")
    job_id = data.get("job_id")
    rating = data.get("rating")
    comments = data.get("comments", "")

    if not recruiter_id or not profile_id or not job_id or rating is None:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    feedback_entry = {
        "recruiter_id": recruiter_id,
        "profile_id": profile_id,
        "job_id": job_id,
        "rating": rating,
        "comments": comments
    }
    feedback_db["profile_ratings"].append(feedback_entry)
    profile_scores[profile_id].append(rating)   # <- usar para ajustar recomendaciones

    return jsonify({"message": "Feedback de perfil recibido", "data": feedback_entry}), 201

@app.post("/recommend/jobs_for_cv")
def recommend_jobs_for_cv():
    data = request.get_json(silent=True) or {}
    cv_text = data.get("cv_text") or request.form.get("cv_text")
    topk = int(request.form.get("topk") or data.get("topk") or 10)
    if not cv_text:
        return jsonify({"error":"CV required"}), 400
    results = search_jobs_vector(cv_text, topk=topk)
    return jsonify({"results": results})

@app.post("/recommend/candidates_for_job")
def recommend_candidates_for_job():
    data = request.get_json(force=True)
    job_vector_id = data.get("job_vector_id")
    topk = int(data.get("topk") or 10)
    if not job_vector_id:
        return jsonify({"error":"job_vector_id required"}), 400
    if job_vector_id not in job_meta:
        return jsonify({"error":"job not found"}), 404
    keys = list(job_meta.keys())
    idx = keys.index(job_vector_id)
    try:
        job_vec = job_index.reconstruct(idx).astype("float32")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    norm = np.linalg.norm(job_vec)+1e-12
    job_vec = job_vec / norm
    res = search_cands_from_vec(job_vec, topk=topk)
    return jsonify({"results": res})

@app.post("/jobs/<job_id>/favorite")
def favorite_job(job_id):
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    if not user_id: return jsonify({"error":"user_id required"}), 400
    FAVORITE_JOBS.setdefault(user_id,[])
    if job_id not in FAVORITE_JOBS[user_id]:
        FAVORITE_JOBS[user_id].append(job_id)
    return jsonify({"favorites": FAVORITE_JOBS[user_id]})

@app.post("/jobs/<job_id>/favorite_profile")
def favorite_profile(job_id):
    data = request.get_json(force=True)
    recruiter = data.get("recruiter_id"); profile = data.get("profile_id")
    if not recruiter or not profile: return jsonify({"error":"missing"}),400
    FAVORITE_PROFILES.setdefault(job_id,{})
    FAVORITE_PROFILES[job_id].setdefault(recruiter,[])
    if profile not in FAVORITE_PROFILES[job_id][recruiter]:
        FAVORITE_PROFILES[job_id][recruiter].append(profile)
    return jsonify({"favorites": FAVORITE_PROFILES[job_id][recruiter]})

@app.get("/dashboard/applicant/<user_id>")
def dashboard_applicant(user_id):
    # find candidate
    cand = next((c for c in candidates_db.getAll() if c.get("id")==user_id), None)
    favs = FAVORITE_JOBS.get(user_id, [])
    recs = []
    avg = 0.0
    if cand:
        q = ' '.join(cand.get("skills",[]))
        recs = search_jobs_vector(q, topk=8)
        if recs:
            avg = round(sum([r['score'] for r in recs])/len(recs),4)
    fav_jobs = [j for j in jobs_db.getAll() if j.get("id") in favs]
    return jsonify({"recommendations": recs, "favorites": fav_jobs, "avg_match_rate": avg})

@app.get("/dashboard/recruiter/<recruiter_id>")
def dashboard_recruiter(recruiter_id):
    r_jobs = [j for j in jobs_db.getAll() if j.get("recruiter_id")==recruiter_id]
    suggestions=[]; skills_counter=Counter(); scores=[]
    for job in r_jobs:
        vid = job.get("vector_id")
        if not vid or vid not in job_meta: continue
        keys=list(job_meta.keys()); idx=keys.index(vid)
        try:
            job_vec = job_index.reconstruct(idx).astype("float32")
        except:
            continue
        res = search_cands_from_vec(job_vec, topk=6)
        for r in res:
            suggestions.append(r); scores.append(r['score'])
        for s in job.get("skills",[]): skills_counter[s]+=1
    top_skills = skills_counter.most_common(10)
    avg = round(sum(scores)/len(scores),4) if scores else 0.0
    return jsonify({"suggestions": suggestions, "top_skills": top_skills, "avg_match_rate": avg})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=APP_PORT, debug=True)
