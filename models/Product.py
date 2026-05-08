from typing import Optional
from models.Store import Store
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    id:Optional[int] = Field(default=None, primary_key=True)
    name:Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    price:float = Field(default=None)
    acquisition_price:float = Field(default=None)
    stock:float = Field(default=None)
    store_id:Optional[int] = Field(foreign_key='store.id')

class ProductCreate(SQLModel):
    name: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    price: float = Field(default=None)
    acquisition_price: float = Field(default=None)
    stock: float = Field(default=None)
    store_id: Optional[int] = Field(foreign_key='store.id')