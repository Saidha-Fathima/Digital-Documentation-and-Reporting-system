from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from models import User, Job, Material, SparePart
from auth import hash_password
from routes import users, jobs, materials, spareparts
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workshop Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(materials.router, prefix="/api", tags=["Materials"])
app.include_router(spareparts.router, prefix="/api", tags=["Spare Parts"])

# -------------------------------
# DATABASE SEED FUNCTION
# -------------------------------
def create_default_data():
    db = SessionLocal()
    
    # Create default users
    admin = db.query(User).filter(User.email == "manager@example.com").first()
    employee = db.query(User).filter(User.email == "employee@example.com").first()
    
    if not admin:
        admin_user = User(
            email="manager@example.com",
            password=hash_password("manager123"),
            role="manager",
            name="Manager User"
        )
        db.add(admin_user)
    
    if not employee:
        employee_user = User(
            email="employee@example.com",
            password=hash_password("employee123"),
            role="employee",
            name="Employee User"
        )
        db.add(employee_user)
    
    db.commit()
    
    # Get employee ID for assignments
    employee_user = db.query(User).filter(User.email == "employee@example.com").first()
    
    # Create sample jobs if none exist
    if db.query(Job).count() == 0 and employee_user:
        sample_jobs = [
            Job(
                job_title="Engine Overhaul",
                assigned_to=employee_user.id,
                status="in progress",
                progress=45,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            Job(
                job_title="Oil Change",
                assigned_to=employee_user.id,
                status="pending",
                progress=0,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            Job(
                job_title="Brake System Inspection",
                assigned_to=None,
                status="pending",
                progress=0,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            Job(
                job_title="Hydraulic Repair",
                assigned_to=employee_user.id,
                status="completed",
                progress=100,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]
        db.add_all(sample_jobs)
        db.commit()
    
    # Create sample materials if none exist
    if db.query(Material).count() == 0:
        sample_materials = [
            Material(material_name="Steel Bolts M12", quantity=150, minimum_level=50, unit="pcs"),
            Material(material_name="Steel Bolts M16", quantity=30, minimum_level=40, unit="pcs"),
            Material(material_name="Nylon Washers", quantity=200, minimum_level=100, unit="pcs"),
            Material(material_name="Hydraulic Oil", quantity=80, minimum_level=100, unit="liters"),
            Material(material_name="Welding Rods", quantity=25, minimum_level=50, unit="pcs"),
            Material(material_name="Sandpaper Pack", quantity=45, minimum_level=30, unit="packs"),
        ]
        db.add_all(sample_materials)
        db.commit()
    
    # Create sample spare parts if none exist and employee exists
    if db.query(SparePart).count() == 0 and employee_user:
        sample_parts = [
            SparePart(
                part_name="Fuel Injector",
                quantity_used=2,
                used_by=employee_user.id,
                used_date=datetime.now()
            ),
            SparePart(
                part_name="Oil Filter",
                quantity_used=5,
                used_by=employee_user.id,
                used_date=datetime.now()
            ),
            SparePart(
                part_name="Drive Belt",
                quantity_used=1,
                used_by=employee_user.id,
                used_date=datetime.now()
            ),
            SparePart(
                part_name="Hydraulic Seal",
                quantity_used=4,
                used_by=employee_user.id,
                used_date=datetime.now()
            )
        ]
        db.add_all(sample_parts)
        db.commit()
    
    db.close()

# Call seed function on startup
@app.on_event("startup")
def startup_event():
    create_default_data()

@app.get("/")
def root():
    return {
        "message": "Workshop Manager API",
        "version": "1.0.0",
        "endpoints": [
            "/api/login",
            "/api/me",
            "/api/jobs",
            "/api/materials",
            "/api/spareparts"
        ]
    }