from fastapi import FastAPI
from sqlmodel import SQLModel
from config.db import engine
from models import *
from routes.role_router import role_router
from routes.user_router import user_router
from routes.store_router import store_router
from config.security import security
SQLModel.metadata.create_all(engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"Store Manager"}

app.include_router(role_router)
app.include_router(user_router)
app.include_router(security)
app.include_router(store_router)