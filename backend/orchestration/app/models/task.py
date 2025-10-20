from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    DECOMPOSING = "decomposing"
    EXECUTING = "executing"
    COORDINATING = "coordinating"
    SYNTHESIZING = "synthesizing"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    REVISION_REQUESTED = "revision_requested"
    FAILED = "failed"

class AgentType(str, Enum):
    MANAGER = "manager"
    SPECIALIST = "specialist"
    COORDINATOR = "coordinator"
    ANALYST = "analyst"

class SpecialistRole(str, Enum):
    DEVELOPER = "developer"
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    DESIGNER = "designer"
    DATA_SCIENTIST = "data_scientist"
    WRITER = "writer"
    QA_ENGINEER = "qa_engineer"

class StartTaskRequest(BaseModel):
    taskId: str
    title: str
    description: str
    priority: TaskPriority

class ReviseTaskRequest(BaseModel):
    taskId: str
    feedback: str
    previousAnswer: Optional[str] = None

class SubtaskModel(BaseModel):
    id: str
    title: str
    description: str
    role: SpecialistRole
    status: str = "pending"
    solution: Optional[str] = None

class AgentModel(BaseModel):
    id: str
    type: AgentType
    name: str
    role: Optional[SpecialistRole] = None
    status: str = "idle"
    currentAction: Optional[str] = None
    progress: Optional[int] = None
