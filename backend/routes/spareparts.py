from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from models import SparePart, User
from schemas import SparePartCreate, SparePartResponse, MonthlySummary
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/spareparts", tags=["Spare Parts"])

@router.get("/", response_model=List[SparePartResponse])
def get_spareparts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parts = db.query(SparePart).all()
    
    result = []
    for part in parts:
        part_dict = {
            "id": part.id,
            "part_name": part.part_name,
            "quantity_used": part.quantity_used,
            "used_by": part.used_by,
            "used_date": part.used_date
        }
        
        if part.used_by:
            user = db.query(User).filter(User.id == part.used_by).first()
            part_dict["used_by_name"] = user.name if user else None
        else:
            part_dict["used_by_name"] = None
            
        result.append(part_dict)
    
    return result

@router.post("/", response_model=SparePartResponse)
def add_sparepart(
    part: SparePartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_part = SparePart(
        part_name=part.part_name,
        quantity_used=part.quantity_used,
        used_by=current_user.id
    )
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    
    result = {
        "id": new_part.id,
        "part_name": new_part.part_name,
        "quantity_used": new_part.quantity_used,
        "used_by": new_part.used_by,
        "used_by_name": current_user.name,
        "used_date": new_part.used_date
    }
    
    return result

@router.delete("/{part_id}")
def delete_sparepart(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete records")
    
    part = db.query(SparePart).filter(SparePart.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Record not found")
    
    db.delete(part)
    db.commit()
    return {"message": "Record deleted successfully"}

@router.get("/summary/monthly", response_model=List[MonthlySummary])
def get_monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view summaries")
    
    results = db.query(
        func.strftime('%Y-%m', SparePart.used_date).label('month'),
        SparePart.part_name,
        func.sum(SparePart.quantity_used).label('total_used')
    ).group_by('month', SparePart.part_name).all()
    
    return [
        {
            "month": r.month,
            "part_name": r.part_name,
            "total_used": r.total_used
        }
        for r in results
    ]