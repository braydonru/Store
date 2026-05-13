from typing import List, Annotated
from sqlalchemy.sql.functions import user
from config.security import require_role
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException

from models import Store
from models.User import User, UserCreateIn, UserCreateOut
from .deps.db_session import SessionDep
from config.security import hash_password
from sqlmodel import select

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/get_user", response_model=List[UserCreateOut])
def get_user(db:SessionDep, u:Annotated[str,Depends(require_role(["SuperAdmin", "Admin"]))])->List[UserCreateOut]:
    response = select(User).filter(User.role!="SuperAdmin")
    users = db.exec(response).all()
    return [UserCreateOut(id=u.id,name=u.name, username=u.username, role=u.role)for u in users]

@user_router.post("/create_worker")
def create_worker(db:SessionDep, u:Annotated[str,Depends(require_role(['Admin', "SuperAdmin"]))], store_id:int, user:UserCreateIn):
    user = User(
        name=user.name,
        username=user.username,
        password=user.password,
        store_id=store_id
    )
    user.password = hash_password(user.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserCreateOut(name=user.name, username=user.username)


@user_router.post("/create_user")
def create_user(db:SessionDep,user: UserCreateIn)->UserCreateOut:
    user = User(
        name=user.name,
        username=user.username,
        password=user.password
    )
    user.password = hash_password(user.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserCreateOut(name=user.name, username=user.username)

@user_router.put("/set_role")
def set_role(db:SessionDep,role:str,id:int, u:Annotated[str,Depends(require_role(["SuperAdmin"]))])->UserCreateOut:
    user = db.get(User,id)
    user.role = role
    db.commit()
    db.refresh(user)
    return UserCreateOut(name=user.name, username=user.username)

@user_router.delete("/delete_user")
def delete_user(db:SessionDep,id:int, u:Annotated[str,Depends(require_role(["Admin"]))])->str:
    user = db.get(User,id)
    db.delete(user)
    db.commit()
    return f'User {id} deleted'

@user_router.get("/get_user_by_store", response_model=List[UserCreateOut])
def get_user_by_store(db:SessionDep,store_id:int)->List[UserCreateOut]:
    store = db.get(Store,store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    users_db = select(User).where(User.store_id == store_id)
    users = db.exec(users_db).all()
    return [UserCreateOut(id=u.id,name=u.name, username=u.username, role = u.role) for u in users]