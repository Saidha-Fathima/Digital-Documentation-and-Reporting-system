from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from models import SparePart, SparePartUsage, User, Notification
from schemas import SparePartCreate, SparePartResponse, SparePartUpdate, SparePartUsageCreate, SparePartUsageResponse, MonthlySummary
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/spareparts", tags=["Spare Parts"])

@router.get("/", response_model=List[SparePartResponse])
def get_spareparts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SparePart).all()

@router.post("/", response_model=SparePartResponse)
def create_sparepart(
    part: SparePartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create spare parts")
        
    new_part = SparePart(**part.dict())
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    return new_part

@router.put("/{part_id}", response_model=SparePartResponse)
def update_sparepart(
    part_id: int,
    part_update: SparePartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update spare parts")
        
    part = db.query(SparePart).filter(SparePart.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Spare part not found")
        
    update_data = part_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(part, field, value)
        
    db.commit()
    db.refresh(part)
    return part

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

@router.post("/{part_id}/use", response_model=SparePartUsageResponse)
def use_sparepart(
    part_id: int,
    usage: SparePartUsageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    part = db.query(SparePart).filter(SparePart.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Spare part not found")
        
    if part.quantity < usage.quantity_used:
        raise HTTPException(status_code=400, detail="Not enough stock available")
        
    part.quantity -= usage.quantity_used
    
    new_usage = SparePartUsage(
        spare_part_id=part_id,
        quantity_used=usage.quantity_used,
        used_by=current_user.id
    )
    db.add(new_usage)
    
    if part.quantity <= part.minimum_level:
        managers = db.query(User).filter(User.role == "manager").all()
        for mgr in managers:
            notification = Notification(
                user_id=mgr.id,
                title="Low Stock Alert",
                message=f"Spare part {part.part_name} is running low ({part.quantity} remaining).",
                is_read=0
            )
            db.add(notification)
            
    db.commit()
    db.refresh(new_usage)
    
    return {
        "id": new_usage.id,
        "spare_part_id": new_usage.spare_part_id,
        "quantity_used": new_usage.quantity_used,
        "used_by": new_usage.used_by,
        "used_by_name": current_user.name,
        "used_date": new_usage.used_date
    }

@router.get("/usages", response_model=List[SparePartUsageResponse])
def get_sparepart_usages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    usages = db.query(SparePartUsage).order_by(SparePartUsage.used_date.desc()).all()
    
    result = []
    for usage in usages:
        usage_dict = {
            "id": usage.id,
            "spare_part_id": usage.spare_part_id,
            "quantity_used": usage.quantity_used,
            "used_by": usage.used_by,
            "used_date": usage.used_date
        }
        
        if usage.used_by:
            user = db.query(User).filter(User.id == usage.used_by).first()
            usage_dict["used_by_name"] = user.name if user else None
            
        # Get part name for display convenience
        part = db.query(SparePart).filter(SparePart.id == usage.spare_part_id).first()
        if part:
            usage_dict["part_name"] = part.part_name
            
        result.append(usage_dict)
        
    return result

@router.get("/summary/monthly", response_model=List[MonthlySummary])
def get_monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view summaries")
    
    results = db.query(
        func.strftime('%Y-%m', SparePartUsage.used_date).label('month'),
        SparePart.part_name,
        func.sum(SparePartUsage.quantity_used).label('total_used')
    ).join(SparePart).group_by('month', SparePart.part_name).all()
    
    return [
        {
            "month": r.month,
            "part_name": r.part_name,
            "total_used": r.total_used
        }
        for r in results
    ]