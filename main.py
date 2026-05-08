from fastapi import FastAPI
from sqlmodel import SQLModel
from config.db import engine
from models import *
from routes.product_router import product_router
from routes.role_router import role_router
from routes.user_router import user_router
from routes.store_router import store_router
from config.security import security
from fastapi.middleware.cors import CORSMiddleware

SQLModel.metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/")
async def root():
    return {"Store Manager"}


app.include_router(role_router)
app.include_router(user_router)
app.include_router(security)
app.include_router(store_router)

app.include_router(product_router)