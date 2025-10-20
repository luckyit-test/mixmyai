from typing import Dict, Any, List
from .base import BaseAgent
import json

class CoordinatorAgent(BaseAgent):
    """
    Coordinator agent collects and organizes all accepted solutions from specialists
    """

    async def coordinate_solutions(self, task: Dict, solutions: List[Dict]) -> Dict[str, Any]:
        """Collect and organize all specialist solutions"""

        solutions_text = "\n\n".join([
            f"Специалист ({sol.get('role', 'unknown')})\n{sol.get('solution', '')}"
            for sol in solutions
        ])

        prompt = f"""
Вы - Координатор в мультиагентной системе. Ваша задача - собрать и организовать все решения специалистов.

Основная задача:
Название: {task.get('title')}
Описание: {task.get('description')}

Решения специалистов:
{solutions_text}

Организуйте все решения в структурированный формат JSON:
{{
    "summary": "Краткое резюме всех решений",
    "organized_solutions": [
        {{
            "role": "роль специалиста",
            "key_points": ["ключевой пункт 1", "ключевой пункт 2"],
            "solution_summary": "краткое описание решения"
        }}
    ],
    "cross_references": ["связь между решениями 1", "связь 2"],
    "completeness_check": "все ли аспекты задачи покрыты"
}}
"""

        response = await self.call_openai(prompt, max_tokens=2000)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "summary": response,
                "organized_solutions": solutions,
                "cross_references": [],
                "completeness_check": "Completed"
            }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method"""
        task = context.get("task")
        solutions = context.get("solutions", [])

        coordination = await self.coordinate_solutions(task, solutions)

        return {
            "coordination": coordination,
            "solutions_count": len(solutions)
        }
