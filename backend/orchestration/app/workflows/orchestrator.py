from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import asyncio
import httpx

from app.models.task import StartTaskRequest, ReviseTaskRequest, AgentType, SpecialistRole
from app.agents.manager import ManagerAgent
from app.agents.specialist import SpecialistAgent
from app.agents.coordinator import CoordinatorAgent
from app.agents.analyst import AnalystAgent

router = APIRouter()

# API client to communicate with backend API
class BackendClient:
    def __init__(self):
        self.api_url = "http://api:4000"  # Docker service name

    async def update_task(self, task_id: str, status: str, data: Dict = None):
        """Update task status in backend"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.api_url}/api/tasks/{task_id}/update",
                    json={"status": status, **(data or {})}
                )
        except Exception as e:
            print(f"Failed to update task: {e}")

    async def broadcast_event(self, task_id: str, event_type: str, message: str, data: Dict = None):
        """Broadcast event via WebSocket"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.api_url}/api/websocket/broadcast",
                    json={
                        "task_id": task_id,
                        "event_type": event_type,
                        "message": message,
                        "data": data or {}
                    }
                )
        except Exception as e:
            print(f"Failed to broadcast event: {e}")


backend = BackendClient()


class TaskOrchestrator:
    """Main orchestrator for multi-agent workflow"""

    @staticmethod
    async def execute_workflow(task_data: StartTaskRequest):
        """Execute the complete multi-agent workflow"""
        task_id = task_data.taskId

        try:
            # Stage 1: Manager analyzes task
            print(f"[{task_id}] Stage 1: Task Analysis")
            await backend.update_task(task_id, "analyzing")
            await backend.broadcast_event(task_id, "task:status_changed", "Анализ задачи менеджером")

            manager = ManagerAgent("manager_1", "AI Менеджер")
            analysis = await manager.execute({
                "action": "analyze",
                "title": task_data.title,
                "description": task_data.description,
                "priority": task_data.priority
            })

            print(f"[{task_id}] Analysis complete: {analysis.get('required_specialists')}")

            # Stage 2: Create subtasks
            print(f"[{task_id}] Stage 2: Creating Subtasks")
            await backend.update_task(task_id, "decomposing")
            await backend.broadcast_event(task_id, "task:status_changed", "Создание подзадач")

            subtasks_result = await manager.execute({
                "action": "create_subtasks",
                "title": task_data.title,
                "description": task_data.description,
                "specialists": analysis.get("required_specialists", [])
            })

            subtasks = subtasks_result.get("subtasks", [])
            print(f"[{task_id}] Created {len(subtasks)} subtasks")

            # Stage 3: Specialists execute in parallel
            print(f"[{task_id}] Stage 3: Specialists Execution")
            await backend.update_task(task_id, "executing")
            await backend.broadcast_event(task_id, "task:status_changed", f"Выполнение {len(subtasks)} специалистами")

            specialist_tasks = []
            for i, subtask in enumerate(subtasks):
                specialist = SpecialistAgent(
                    f"specialist_{i}",
                    f"{subtask.role.value.title()} Specialist",
                    subtask.role
                )

                task = specialist.execute({
                    "subtask": subtask.dict(),
                    "main_task_context": f"{task_data.title}: {task_data.description}"
                })
                specialist_tasks.append(task)

            # Execute all specialists in parallel
            solutions = await asyncio.gather(*specialist_tasks)
            print(f"[{task_id}] All specialists completed")

            # Stage 4: Manager reviews solutions
            accepted_solutions = []
            for i, solution in enumerate(solutions):
                review = await manager.execute({
                    "action": "review_solution",
                    "subtask": subtasks[i].dict(),
                    "solution": solution.get("solution")
                })

                if review.get("accepted", True):
                    accepted_solutions.append({
                        "role": solution.get("specialist_role"),
                        "solution": solution.get("solution"),
                        "quality_score": review.get("quality_score", 8)
                    })

            print(f"[{task_id}] {len(accepted_solutions)} solutions accepted")

            # Stage 5: Coordinator collects solutions
            print(f"[{task_id}] Stage 5: Coordination")
            await backend.update_task(task_id, "coordinating")
            await backend.broadcast_event(task_id, "task:status_changed", "Координация решений")

            coordinator = CoordinatorAgent("coordinator_1", "Координатор")
            coordination_result = await coordinator.execute({
                "task": {
                    "title": task_data.title,
                    "description": task_data.description
                },
                "solutions": accepted_solutions
            })

            print(f"[{task_id}] Coordination complete")

            # Stage 6: Analyst synthesizes final answer
            print(f"[{task_id}] Stage 6: Synthesis")
            await backend.update_task(task_id, "synthesizing")
            await backend.broadcast_event(task_id, "task:status_changed", "Синтез итогового ответа")

            analyst = AnalystAgent("analyst_1", "Главный Аналитик")
            analysis_result = await analyst.execute({
                "task": {
                    "title": task_data.title,
                    "description": task_data.description
                },
                "coordination": coordination_result.get("coordination")
            })

            final_answer = analysis_result.get("final_answer")
            print(f"[{task_id}] Final answer synthesized")

            # Stage 7: Manager reviews final answer
            print(f"[{task_id}] Stage 7: Final Review")
            await backend.update_task(task_id, "reviewing")
            await backend.broadcast_event(task_id, "task:status_changed", "Финальная проверка менеджером")

            final_review = await manager.execute({
                "action": "review_final",
                "task": {
                    "title": task_data.title,
                    "description": task_data.description
                },
                "final_answer": final_answer
            })

            # Stage 8: Complete
            print(f"[{task_id}] Stage 8: Completion")
            if final_review.get("approved", True):
                await backend.update_task(task_id, "completed", {
                    "finalAnswer": final_answer,
                    "completedAt": "now"
                })
                await backend.broadcast_event(task_id, "task:completed", "Задача успешно выполнена")
                print(f"[{task_id}] ✅ Workflow completed successfully")
            else:
                await backend.update_task(task_id, "failed", {
                    "error": "Final review failed"
                })
                print(f"[{task_id}] ❌ Final review failed")

        except Exception as e:
            print(f"[{task_id}] ❌ Error: {str(e)}")
            await backend.update_task(task_id, "failed", {
                "error": str(e)
            })
            await backend.broadcast_event(task_id, "error", f"Ошибка: {str(e)}")


@router.post("/start")
async def start_task(request: StartTaskRequest):
    """Start multi-agent workflow for a task"""
    print(f"Starting workflow for task: {request.taskId}")

    # Run workflow in background
    asyncio.create_task(TaskOrchestrator.execute_workflow(request))

    return {
        "success": True,
        "taskId": request.taskId,
        "message": "Workflow started"
    }


@router.post("/revise")
async def revise_task(request: ReviseTaskRequest):
    """Restart workflow with revision context"""
    print(f"Revising task: {request.taskId}")

    # In revision, we restart the workflow with additional context
    # The feedback is added to the task description for context

    start_request = StartTaskRequest(
        taskId=request.taskId,
        title=f"[REVISION] Previous task",
        description=f"""
Previous answer:
{request.previousAnswer}

Revision feedback:
{request.feedback}

Please improve the answer based on the feedback above.
""",
        priority="high"
    )

    asyncio.create_task(TaskOrchestrator.execute_workflow(start_request))

    return {
        "success": True,
        "taskId": request.taskId,
        "message": "Revision workflow started"
    }
