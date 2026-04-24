from typing import Optional
from sqlmodel import Field, SQLModel

class Role(SQLModel, table=True):
    id:Optional[int] = Field(default=None, primary_key=True)
    name:Optional[str] = Field(default=None)

class RoleCreateIn(SQLModel):
    name: str = Field(default=None)

class RoleCreateOut(SQLModel):
    name: str = Field(default=None)