from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    role: Optional[str] = "employee"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Job schemas
class JobBase(BaseModel):
    job_title: str
    assigned_to: Optional[int] = None
    status: str = "pending"
    progress: int = 0

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    assigned_to: Optional[int] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class JobResponse(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assigned_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Material schemas
class MaterialBase(BaseModel):
    material_name: str
    quantity: int
    minimum_level: int = 5
    unit: str = "pcs"

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    material_name: Optional[str] = None
    quantity: Optional[int] = None
    minimum_level: Optional[int] = None
    unit: Optional[str] = None

class MaterialResponse(MaterialBase):
    id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Spare Part schemas
class SparePartBase(BaseModel):
    part_name: str
    quantity_used: int = 1

class SparePartCreate(SparePartBase):
    pass

class SparePartResponse(SparePartBase):
    id: int
    used_by: int
    used_by_name: Optional[str] = None
    used_date: datetime
    
    class Config:
        from_attributes = True

class MonthlySummary(BaseModel):
    month: str
    part_name: str
    total_used: int

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse