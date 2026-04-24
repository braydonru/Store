from collections import namedtuple
from typing import List, Annotated
from config.security import require_role
from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from models.User import User, UserCreateIn, UserCreateOut
from .deps.db_session import SessionDep
from config.security import hash_password
from sqlmodel import select

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/get_user", response_model=List[UserCreateOut])
def get_user(db:SessionDep, u:Annotated[str,Depends(require_role(["Admin"]))])->List[UserCreateOut]:
    response = select(User)
    users = db.exec(response).all()
    return [UserCreateOut(name=u.name, username=u.username)for u in users]


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
def set_role(db:SessionDep,role:str,id:int, u:Annotated[str,Depends(require_role(["Admin"]))])->UserCreateOut:
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