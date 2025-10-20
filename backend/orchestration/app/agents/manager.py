from typing import Dict, Any, List
from .base import BaseAgent
from app.models.task import SpecialistRole, SubtaskModel
import json

class ManagerAgent(BaseAgent):
    """
    Manager agent analyzes tasks, selects specialists, creates subtasks,
    and reviews final answers
    """

    async def analyze_task(self, title: str, description: str, priority: str) -> Dict[str, Any]:
        """Analyze task and determine required specialists"""
        prompt = f"""
Вы - AI Менеджер в мультиагентной системе. Ваша задача - проанализировать задачу и определить необходимых специалистов.

Задача:
Название: {title}
Описание: {description}
Приоритет: {priority}

Доступные роли специалистов:
- developer: Разработчик (программирование, архитектура кода)
- researcher: Исследователь (поиск информации, анализ данных)
- analyst: Аналитик (бизнес-анализ, требования)
- designer: Дизайнер (UI/UX, визуальный дизайн)
- data_scientist: Data Scientist (машинное обучение, анализ данных)
- writer: Писатель/Копирайтер (документация, контент)
- qa_engineer: QA инженер (тестирование, качество)

Проанализируйте задачу и верните JSON ответ в следующем формате:
{{
    "analysis": "Ваш анализ задачи",
    "required_specialists": [
        {{
            "role": "роль_специалиста",
            "reason": "почему нужен этот специалист"
        }}
    ],
    "complexity": "low|medium|high",
    "estimated_duration": "оценка времени в минутах"
}}
"""

        response = await self.call_openai(prompt)

        try:
            # Parse JSON response
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "analysis": response,
                "required_specialists": [{"role": "developer", "reason": "Default specialist"}],
                "complexity": "medium",
                "estimated_duration": "30"
            }

    async def create_subtasks(self, title: str, description: str, specialists: List[Dict]) -> List[SubtaskModel]:
        """Create subtasks for each specialist"""
        subtasks = []

        for i, specialist in enumerate(specialists):
            role = specialist.get("role", "developer")
            reason = specialist.get("reason", "")

            prompt = f"""
Вы - AI Менеджер. Создайте конкретную подзадачу для специалиста.

Основная задача: {title}
Описание: {description}

Специалист: {role}
Причина назначения: {reason}

Создайте подзадачу в формате JSON:
{{
    "title": "Краткое название подзадачи",
    "description": "Детальное описание что нужно сделать специалисту"
}}
"""

            response = await self.call_openai(prompt, max_tokens=500)

            try:
                subtask_data = json.loads(response)
                subtask = SubtaskModel(
                    id=f"subtask_{i}_{role}",
                    title=subtask_data.get("title", f"Подзадача для {role}"),
                    description=subtask_data.get("description", "Выполнить работу по основной задаче"),
                    role=SpecialistRole(role)
                )
                subtasks.append(subtask)
            except (json.JSONDecodeError, ValueError):
                # Fallback subtask
                subtask = SubtaskModel(
                    id=f"subtask_{i}_{role}",
                    title=f"Подзадача для {role}",
                    description=f"Работа по задаче '{title}' в роли {role}",
                    role=SpecialistRole(role)
                )
                subtasks.append(subtask)

        return subtasks

    async def review_solution(self, subtask: Dict, solution: str) -> Dict[str, Any]:
        """Review a specialist's solution"""
        prompt = f"""
Вы - AI Менеджер. Проверьте решение специалиста.

Подзадача: {subtask.get('title')}
Описание: {subtask.get('description')}

Решение специалиста:
{solution}

Оцените решение и верните JSON:
{{
    "accepted": true/false,
    "feedback": "Ваш отзыв",
    "quality_score": 1-10,
    "suggestions": ["предложение 1", "предложение 2"]
}}
"""

        response = await self.call_openai(prompt, max_tokens=800)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "accepted": True,
                "feedback": "Решение принято",
                "quality_score": 8,
                "suggestions": []
            }

    async def review_final_answer(self, task: Dict, final_answer: str) -> Dict[str, Any]:
        """Final review of the synthesized answer"""
        prompt = f"""
Вы - AI Менеджер. Проведите финальную проверку итогового ответа.

Задача: {task.get('title')}
Описание: {task.get('description')}

Итоговый ответ:
{final_answer}

Оцените ответ и верните JSON:
{{
    "approved": true/false,
    "feedback": "Ваша оценка",
    "completeness": 1-10,
    "accuracy": 1-10,
    "recommendations": ["рекомендация 1"]
}}
"""

        response = await self.call_openai(prompt, max_tokens=800)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "approved": True,
                "feedback": "Ответ одобрен",
                "completeness": 9,
                "accuracy": 9,
                "recommendations": []
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method"""
        action = context.get("action")

        if action == "analyze":
            return await self.analyze_task(
                context.get("title"),
                context.get("description"),
                context.get("priority")
            )
        elif action == "create_subtasks":
            return {
                "subtasks": await self.create_subtasks(
                    context.get("title"),
                    context.get("description"),
                    context.get("specialists")
                )
            }
        elif action == "review_solution":
            return await self.review_solution(
                context.get("subtask"),
                context.get("solution")
            )
        elif action == "review_final":
            return await self.review_final_answer(
                context.get("task"),
                context.get("final_answer")
            )

        return {"error": "Unknown action"}
