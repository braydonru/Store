from models.Product import Product, ProductCreate
from fastapi import APIRouter
from routes.deps.db_session import SessionDep
from sqlmodel import select
product_router = APIRouter(prefix="/product", tags=["product"])

@product_router.get("/get_product")
def get_product_by_store(db:SessionDep, store_id:int):
    if(store_id==0):
        res = select(Product)
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
