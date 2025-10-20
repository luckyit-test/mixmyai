from typing import Dict, Any
from .base import BaseAgent

class AnalystAgent(BaseAgent):
    """
    Analyst agent synthesizes final comprehensive answer from all coordinated solutions
    """

    async def synthesize_answer(self, task: Dict, coordination: Dict) -> str:
        """Create final comprehensive answer"""

        prompt = f"""
Вы - Главный Аналитик в мультиагентной AI системе. Ваша задача - создать финальный комплексный ответ на основе работы всех специалистов.

Исходная задача пользователя:
Название: {task.get('title')}
Описание: {task.get('description')}

Координированные решения специалистов:
{coordination}

Создайте финальный, всеобъемлющий ответ, который:
1. Полностью отвечает на исходный запрос пользователя
2. Интегрирует все решения специалистов в единое целое
3. Структурирован и легко читается
4. Содержит конкретные рекомендации и действия
5. Профессионален и понятен пользователю

Формат ответа:
- Используйте заголовки для структурирования
- Используйте списки и нумерацию где уместно
- Будьте конкретны и практичны
- Добавьте краткое резюме в начале
- Завершите следующими шагами или рекомендациями

Создайте финальный ответ:
"""

        # Use Claude Opus for synthesis (better at comprehensive analysis)
        final_answer = await self.call_anthropic(prompt, max_tokens=4000)

        return final_answer

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method"""
        task = context.get("task")
        coordination = context.get("coordination")

        final_answer = await self.synthesize_answer(task, coordination)

        return {
            "final_answer": final_answer
        }
