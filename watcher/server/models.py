from typing import List, Optional

from pydantic import BaseModel


class TranscriptEvent(BaseModel):
    timestamp: float
    text: str
    translation: Optional[str]
    srtTime: List[str]


class ClientError(BaseModel):
    message: str


class Timestamp(BaseModel):
    duration: Optional[int]
    epoch: Optional[int]
