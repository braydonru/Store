from typing import Optional
from .Role import Role
from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id:Optional[int] = Field(default=None, primary_key=True)
    name:Optional[str] = Field(default=None)
    username:Optional[str] = Field(default=None, unique=True)
    password:Optional[str] = Field(default=None)
    role:Optional[str] = Field(default="User")
    store_id:Optional[int] = Field(default=0)

class UserCreateIn(SQLModel):
    name: Optional[str] = Field(default=None)
    username: Optional[str] = Field(default=None, unique=True)
    password: Optional[str] = Field(default=None)
    store_id: Optional[int] = Field(default=0)

class UserCreateOut(SQLModel):
    id:Optional[int] = Field(default=None)
    name: Optional[str] = Field(default=None)
    username: Optional[str] = Field(default=None, unique=True)
    role: Optional[str] = Field(default=None)

