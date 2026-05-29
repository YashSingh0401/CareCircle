# backend/app/ml/prediction/wait_time_predictor.py
import statistics
from datetime import datetime

from app.db import supabase as neon


class WaitTimePredictor:
    """
    Predicts wait time using rolling average of recent consultations.
    Formula: W_t = k * (1/N * sum(D_i)) where k=position, N=last 3-5 completed
    """

    async def predict(self, queue_id: str, position: int) -> dict:
        try:
            entries = await neon.fetch(
                """
                SELECT check_in_time, completed_time
                FROM queue_entries
                WHERE queue_id = $1 AND status = 'completed'
                ORDER BY completed_time DESC
                LIMIT 5
                """,
                queue_id,
            )

            durations = []
            for entry in entries:
                ci = entry.get("check_in_time")
                co = entry.get("completed_time")
                if ci and co:
                    try:
                        start = ci if isinstance(ci, datetime) else datetime.fromisoformat(str(ci).replace("Z", "+00:00"))
                        end = co if isinstance(co, datetime) else datetime.fromisoformat(str(co).replace("Z", "+00:00"))
                        duration_mins = (end - start).seconds / 60
                        if 1 <= duration_mins <= 120:
                            durations.append(duration_mins)
                    except Exception:
                        pass

            if durations:
                avg_duration = statistics.mean(durations)
            else:
                avg_duration = await neon.fetchval(
                    "SELECT average_consultation_time FROM queues WHERE id = $1",
                    queue_id,
                ) or 15

            estimated_wait = int(position * avg_duration)

            return {
                "estimated_minutes": estimated_wait,
                "avg_consultation_minutes": round(avg_duration, 1),
                "position": position,
                "confidence": "high" if len(durations) >= 3 else "medium" if len(durations) >= 1 else "low",
            }
        except Exception:
            return {
                "estimated_minutes": position * 15,
                "avg_consultation_minutes": 15,
                "position": position,
                "confidence": "low",
            }

    async def update_queue_average(self, queue_id: str) -> None:
        """Update the stored average after each consultation."""
        result = await self.predict(queue_id, 1)
        await neon.execute(
            "UPDATE queues SET average_consultation_time = $1 WHERE id = $2",
            result["avg_consultation_minutes"], queue_id,
        )
