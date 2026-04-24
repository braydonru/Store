from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    ...