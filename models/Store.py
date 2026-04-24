from typing import Optional
from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field
from .User import User

class Store(SQLModel, table=True):
    id:Optional[int] = Field(default=None, primary_key=True)
    name:Optional[str] = Field(default=None)
    owner:Optional[int] = Field(ForeignKey('user.id',  ondelete='CASCADE', onupdate='CASCADE'))


class StoreCreateIn(SQLModel):
    name:Optional[str] = Field(default=None)

class StoreCreateOut(SQLModel):
    name:Optional[str] = Field(default=None)