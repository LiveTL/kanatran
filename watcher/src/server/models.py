from pydantic import BaseModel


class Log(BaseModel):
    text: str


class ClientError(BaseModel):
    message: str


class Timestamp(BaseModel):
    current: int
