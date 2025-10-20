from typing import Dict, Any
from .base import BaseAgent
from app.models.task import SpecialistRole

class SpecialistAgent(BaseAgent):
    """
    Specialist agent solves assigned subtasks based on their role
    """

    def __init__(self, agent_id: str, name: str, role: SpecialistRole):
        super().__init__(agent_id, name)
        self.role = role

    async def solve_subtask(self, subtask: Dict[str, Any], main_task_context: str = "") -> str:
        """Solve the assigned subtask"""

        role_prompts = {
            SpecialistRole.DEVELOPER: "Вы - опытный разработчик. Предоставьте техническое решение с примерами кода, архитектурными решениями.",
            SpecialistRole.RESEARCHER: "Вы - исследователь. Проведите анализ, найдите релевантную информацию, предоставьте данные и источники.",
            SpecialistRole.ANALYST: "Вы - бизнес-аналитик. Проанализируйте требования, создайте спецификации, оцените бизнес-ценность.",
            SpecialistRole.DESIGNER: "Вы - UX/UI дизайнер. Создайте концепцию дизайна, опишите пользовательский опыт.",
            SpecialistRole.DATA_SCIENTIST: "Вы - Data Scientist. Примените методы машинного обучения, анализа данных.",
            SpecialistRole.WRITER: "Вы - профессиональный писатель. Создайте качественный контент, документацию.",
            SpecialistRole.QA_ENGINEER: "Вы - QA инженер. Разработайте стратегию тестирования, опишите тест-кейсы.",
        }

        role_prompt = role_prompts.get(self.role, "Вы - специалист.")

        prompt = f"""
{role_prompt}

Контекст основной задачи: {main_task_context}

Ваша подзадача:
Название: {subtask.get('title')}
Описание: {subtask.get('description')}

Предоставьте детальное, профессиональное решение вашей подзадачи.
Структурируйте ответ, используйте списки, примеры где необходимо.
Будьте конкретны и практичны.
"""

        # Use OpenAI for most specialists
        solution = await self.call_openai(prompt, max_tokens=3000)

        return solution

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method"""
        subtask = context.get("subtask")
        main_task_context = context.get("main_task_context", "")

        solution = await self.solve_subtask(subtask, main_task_context)

        return {
            "subtask_id": subtask.get("id"),
            "solution": solution,
            "specialist_role": self.role.value
        }
