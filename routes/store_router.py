from typing import List, Annotated
from sqlmodel import select
from fastapi import APIRouter, Depends, HTTPException
from config.security import require_role
from models import Product
from models.Store import Store, StoreCreateIn, StoreCreateOut, StoreOut
from models.User import User
from .deps.db_session import SessionDep
store_router = APIRouter(prefix="/store", tags=["Store"])

@store_router.get("/get_store")
def get_store(db:SessionDep):
    response = select(Store)
    store = db.exec(response).all()
    return store

@store_router.get("/get_store_by_owner")
def get_store_by_owner(db:SessionDep, owner_id:int):
    response = select(Store).where(Store.owner == owner_id)
    store = db.exec(response).all()
    return store

@store_router.get("/get_working_store")
def get_working_store(db:SessionDep, user_id:int):
    user = db.get(User,user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    store_db = select(Store).where(Store.id == user.store_id)
    store = db.exec(store_db).all()
    return store

@store_router.post("/create_store")
def create_store(store:StoreCreateIn, db:SessionDep, owner_username:str, user:Annotated[str,Depends(require_role(["SuperAdmin"]))])->StoreCreateOut:
    res = select(User).where(User.username == owner_username)
    user = db.exec(res).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    store_db = Store(name=store.name, owner=user.id)
    db.add(store_db)
    db.commit()
    db.refresh(store_db)
    return StoreCreateOut(name=store.name)

@store_router.delete("/delete_store")
def delete_store(db:SessionDep, store_id:int, owner_id:int, user:Annotated[str,Depends(require_role(["SuperAdmin","Admin"]))]):
    store=db.get(Store,store_id)
    res= select(Product).where(Product.store_id == store_id)
    products = db.exec(res).all()
    user = db.get(User,owner_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    elif user.role == "SuperAdmin":
        for p in products:
            db.delete(p)
        db.delete(store)
        db.commit()
    elif user.role == "Admin":
        if store.owner!=owner_id:
            raise HTTPException(status_code=403, detail="You can't delete this store")
        else:
            for p in products:
                db.delete(p)
        db.delete(store)
    db.commit()
    return "Store deleted"

@store_router.get("/get_all_stores", response_model=List[StoreOut])
def get_all_stores(db:SessionDep)->List[StoreOut]:
    store_db = select(Store)
    stores = db.exec(store_db).all()
    return [StoreOut(id=s.id, name=s.name, owner=db.get(User,s.owner).name) for s in stores]


