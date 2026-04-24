from typing import List, Annotated
from fastapi import APIRouter, HTTPException, Depends
from models.Role import Role, RoleCreateIn, RoleCreateOut
from routes.deps.db_session import SessionDep
from sqlmodel import select
from config.security import require_role
role_router = APIRouter(prefix="/role", tags=["Role"])

@role_router.get("/get_roles", response_model=List[RoleCreateOut])
def get_roles(db:SessionDep, user:Annotated[str,Depends(require_role(["Admin"]))])->List[RoleCreateOut]:
    res = select(Role)
    role = db.exec(res).all()
    return [RoleCreateOut(name=r.name) for r in role]

@role_router.post("/create_role")
def create_role(db:SessionDep, role:RoleCreateIn, user:Annotated[str,Depends(require_role(["Admin"]))])->RoleCreateOut:
    r = Role(name=role.name)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@role_router.delete("/delete_role/{id}")
def delete_role(db:SessionDep, id:int, user:Annotated[str,Depends(require_role(["Admin"]))]):
    r = db.get(Role, id)
    if not r:
        raise HTTPException(detail="Role not found",status_code= 404)
    db.delete(r)
    db.commit()
    return "Role deleted"