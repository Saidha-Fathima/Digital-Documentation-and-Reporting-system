from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Material, User, MaterialUsage, Notification
from schemas import MaterialCreate, MaterialResponse, MaterialUpdate, MaterialUsageCreate, MaterialUsageResponse
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.get("/", response_model=List[MaterialResponse])
def get_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Material).all()

@router.post("/", response_model=MaterialResponse)
def create_material(
    material: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create materials")
    
    new_material = Material(**material.dict())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    material_update: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update materials")
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    update_data = material_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    return material

@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete materials")
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}

@router.post("/{material_id}/use", response_model=MaterialUsageResponse)
def use_material(
    material_id: int,
    usage: MaterialUsageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    if material.quantity < usage.quantity_used:
        raise HTTPException(status_code=400, detail="Not enough stock available")
        
    material.quantity -= usage.quantity_used
    
    new_usage = MaterialUsage(
        material_id=material_id,
        quantity_used=usage.quantity_used,
        used_by=current_user.id
    )
    db.add(new_usage)
    
    # Check for low stock alert
    if material.quantity <= material.minimum_level:
        managers = db.query(User).filter(User.role == "manager").all()
        for mgr in managers:
            notification = Notification(
                user_id=mgr.id,
                title="Low Stock Alert",
                message=f"Material {material.material_name} is running low ({material.quantity} remaining).",
                is_read=0
            )
            db.add(notification)
            
    db.commit()
    db.refresh(new_usage)
    
    return {
        "id": new_usage.id,
        "material_id": new_usage.material_id,
        "quantity_used": new_usage.quantity_used,
        "used_by": new_usage.used_by,
        "used_by_name": current_user.name,
        "used_date": new_usage.used_date
    }