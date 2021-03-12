from typing import List, Optional

from pydantic import BaseModel


class Log(BaseModel):
    text: str


class ClientError(BaseModel):
    message: str


class Timestamp(BaseModel):
    duration: Optional[int]
    epoch: Optional[int]
