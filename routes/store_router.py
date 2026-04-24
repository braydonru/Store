from typing import List, Annotated
from sqlmodel import select
from fastapi import APIRouter, Depends, HTTPException
from config.security import require_role
from models.Store import Store, StoreCreateIn, StoreCreateOut
from models.User import User
from .deps.db_session import SessionDep
store_router = APIRouter(prefix="/store", tags=["Store"])

@store_router.get("/get_store", response_model=List[StoreCreateOut])
def get_store(db:SessionDep, user:Annotated[str,Depends(require_role(["Admin","User"]))])->List[StoreCreateOut]:
    response = select(Store)
    store = db.exec(response).all()
    return [StoreCreateOut(name=s.name) for s in store]

@store_router.post("/create_store")
def create_store(store:StoreCreateIn, db:SessionDep, owner_id:int, user:Annotated[str,Depends(require_role(["Admin"]))])->StoreCreateOut:
    store_db = Store(name=store.name, owner=owner_id)
    db.add(store_db)
    db.commit()
    db.refresh(store_db)
    return StoreCreateOut(name=store.name)

@store_router.delete("/delete_store")
def delete_store(db:SessionDep, store_id:int, owner_id:int, user:Annotated[str,Depends(require_role(["Admin"]))]):
    store=db.get(Store,store_id)
    if store.owner!=owner_id:
        raise HTTPException(status_code=403, detail="You can't delete this store")
    db.delete(store)
    db.commit()
    return "Store deleted"


