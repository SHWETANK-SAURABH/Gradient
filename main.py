from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from routers import exams, calendar, pyqs, auth, files

app = FastAPI(title="Gradient Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set your frontend domain(s) here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth")
app.include_router(exams.router, prefix="/exams")
app.include_router(calendar.router, prefix="/calendar")
app.include_router(pyqs.router, prefix="/pyqs")
app.include_router(files.router, prefix="/files")  # For file uploads/downloads

@app.get("/")
def read_root():
    return {"status": "Backend running 🚀"}