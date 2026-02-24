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
    spare_parts = relationship("SparePart", back_populates="user")

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
    quantity_used = Column(Integer, default=1)
    used_by = Column(Integer, ForeignKey("users.id"))
    used_date = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="spare_parts")