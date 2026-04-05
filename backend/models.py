from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String, default="")
    role = Column(String, default="employee")
    
    jobs = relationship("Job", back_populates="assignee")
    spare_part_usages = relationship("SparePartUsage", back_populates="user")
    material_usages = relationship("MaterialUsage", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    assignee = relationship("User", back_populates="jobs")

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    minimum_level = Column(Integer, default=5)
    unit = Column(String, default="pcs")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class SparePart(Base):
    __tablename__ = "spareparts"
    
    id = Column(Integer, primary_key=True, index=True)
    part_name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    minimum_level = Column(Integer, default=5)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class SparePartUsage(Base):
    __tablename__ = "sparepart_usages"
    
    id = Column(Integer, primary_key=True, index=True)
    spare_part_id = Column(Integer, ForeignKey("spareparts.id"))
    quantity_used = Column(Integer, default=1)
    used_by = Column(Integer, ForeignKey("users.id"))
    used_date = Column(DateTime, default=datetime.now)
    
    spare_part = relationship("SparePart")
    user = relationship("User", back_populates="spare_part_usages")

class MaterialUsage(Base):
    __tablename__ = "material_usages"
    
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    quantity_used = Column(Integer, default=1)
    used_by = Column(Integer, ForeignKey("users.id"))
    used_date = Column(DateTime, default=datetime.now)
    
    material = relationship("Material")
    user = relationship("User", back_populates="material_usages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Integer, default=0)  # 0 for false, 1 for true
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="notifications")