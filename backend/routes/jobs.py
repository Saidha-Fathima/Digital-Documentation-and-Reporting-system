from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Job, User
from schemas import JobCreate, JobResponse, JobUpdate
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    jobs = db.query(Job).all()
    
    # Add assigned_name to each job
    result = []
    for job in jobs:
        job_dict = {
            "id": job.id,
            "job_title": job.job_title,
            "assigned_to": job.assigned_to,
            "status": job.status,
            "progress": job.progress,
            "created_at": job.created_at,
            "updated_at": job.updated_at
        }
        
        if job.assigned_to:
            assignee = db.query(User).filter(User.id == job.assigned_to).first()
            job_dict["assigned_name"] = assignee.name if assignee else None
        else:
            job_dict["assigned_name"] = None
            
        result.append(job_dict)
    
    return result

@router.post("/", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create jobs")
    
    new_job = Job(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    result = {
        "id": new_job.id,
        "job_title": new_job.job_title,
        "assigned_to": new_job.assigned_to,
        "status": new_job.status,
        "progress": new_job.progress,
        "created_at": new_job.created_at,
        "updated_at": new_job.updated_at
    }
    
    if new_job.assigned_to:
        assignee = db.query(User).filter(User.id == new_job.assigned_to).first()
        result["assigned_name"] = assignee.name if assignee else None
    
    return result

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    result = {
        "id": job.id,
        "job_title": job.job_title,
        "assigned_to": job.assigned_to,
        "status": job.status,
        "progress": job.progress,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }
    
    if job.assigned_to:
        assignee = db.query(User).filter(User.id == job.assigned_to).first()
        result["assigned_name"] = assignee.name if assignee else None
    
    return result

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete jobs")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.get("/employees", response_model=List[dict])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employees = db.query(User).filter(User.role == "employee").all()
    return [{"id": e.id, "name": e.name} for e in employees]