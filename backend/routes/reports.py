from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from models import Job, User, MaterialUsage, SparePartUsage, Material, SparePart
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Available to everyone, but employees just see basic stats or their own
    if current_user.role == "manager":
        total_jobs = db.query(Job).count()
        completed_jobs = db.query(Job).filter(Job.status == "completed").count()
        in_progress_jobs = db.query(Job).filter(Job.status == "in progress").count()
        pending_jobs = db.query(Job).filter(Job.status == "pending").count()
        
        low_materials = db.query(Material).filter(Material.quantity <= Material.minimum_level).count()
        low_spareparts = db.query(SparePart).filter(SparePart.quantity <= SparePart.minimum_level).count()
    else:
        total_jobs = db.query(Job).filter(Job.assigned_to == current_user.id).count()
        completed_jobs = db.query(Job).filter(Job.assigned_to == current_user.id, Job.status == "completed").count()
        in_progress_jobs = db.query(Job).filter(Job.assigned_to == current_user.id, Job.status == "in progress").count()
        pending_jobs = db.query(Job).filter(Job.assigned_to == current_user.id, Job.status == "pending").count()
        low_materials = 0
        low_spareparts = 0
        
    return {
        "jobs": {
            "total": total_jobs,
            "completed": completed_jobs,
            "in_progress": in_progress_jobs,
            "pending": pending_jobs
        },
        "alerts": {
            "low_materials": low_materials,
            "low_spareparts": low_spareparts
        }
    }

@router.get("/employee-performance")
def get_employee_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view performance reports")
        
    employees = db.query(User).filter(User.role == "employee").all()
    performance = []
    
    for emp in employees:
        total = db.query(Job).filter(Job.assigned_to == emp.id).count()
        completed = db.query(Job).filter(Job.assigned_to == emp.id, Job.status == "completed").count()
        performance.append({
            "employee_id": emp.id,
            "name": emp.name,
            "total_jobs": total,
            "completed_jobs": completed,
            "completion_rate": (completed / total * 100) if total > 0 else 0
        })
        
    return performance

@router.get("/usage-trends")
def get_usage_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view usage trends")
        
    # Get last 6 months or group by day etc.
    # We will just return the material and spare part usage aggregated by date/month
    mat_usage = db.query(
        func.date(MaterialUsage.used_date).label('date'),
        func.sum(MaterialUsage.quantity_used).label('total')
    ).group_by('date').all()
    
    sp_usage = db.query(
        func.date(SparePartUsage.used_date).label('date'),
        func.sum(SparePartUsage.quantity_used).label('total')
    ).group_by('date').all()
    
    return {
        "materials": [{"date": r.date, "total": r.total} for r in mat_usage],
        "spare_parts": [{"date": r.date, "total": r.total} for r in sp_usage]
    }
