from typing import Annotated
from config.security import require_role
from fastapi.params import Depends

from models.Product import Product, ProductCreate
from fastapi import APIRouter, HTTPException
from routes.deps.db_session import SessionDep
from sqlmodel import select
product_router = APIRouter(prefix="/product", tags=["product"])

@product_router.get("/get_product")
def get_product_by_store(db:SessionDep, store_id:int):
    if(store_id==0):
        return []
    else:
        res = select(Product).where(Product.store_id == store_id)
    products = db.exec(res).all()
    return products


@product_router.post("/create_product")
def create_product(db:SessionDep, product:ProductCreate):
    p=Product(**product.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@product_router.delete('/delete_product')
def delete_product(db:SessionDep, product_id:int,u:Annotated[str,Depends(require_role(['Admin']))]):
    db_product = db.get(Product,product_id)
    if not db_product:
        return HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return "product deleted"
