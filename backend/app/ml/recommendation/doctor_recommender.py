# backend/app/ml/recommendation/doctor_recommender.py
from app.db import supabase as neon

class DoctorRecommender:
    """
    Scores doctors by: rating (40%), experience (30%), fee (20%), reviews (10%)
    Filters by specialization, then ranks by composite score.
    """

    def score_doctor(self, doctor: dict, prefs: dict) -> float:
        score = 0.0
        rating = doctor.get("rating", 0) or 0
        experience = doctor.get("experience_years", 0) or 0
        fee = doctor.get("consultation_fee", 0) or 0
        reviews = doctor.get("total_reviews", 0) or 0

        # Rating score (0-5 â†’ 0-1)
        score += (rating / 5.0) * 0.40

        # Experience score (0-30 years â†’ 0-1)
        score += (min(experience, 30) / 30.0) * 0.30

        # Fee score (lower is better, max 2000)
        max_fee = prefs.get("max_fee", 2000) or 2000
        if fee <= max_fee:
            score += (1 - min(fee, max_fee) / max_fee) * 0.20
        # else 0 for fee component

        # Reviews score (0-200 â†’ 0-1)
        score += (min(reviews, 200) / 200.0) * 0.10

        return round(score, 4)

    async def recommend(
        self,
        specialization: str,
        hospital_id: str | None,
        patient_preferences: dict
    ) -> list[dict]:
        where = ["d.is_available = TRUE", "d.specialization ILIKE $1"]
        args: list = [f"%{specialization}%"]
        if hospital_id:
            args.append(hospital_id)
            where.append(f"d.hospital_id = ${len(args)}")

        sql = f"""
            SELECT d.*,
                   h.name   AS hospital_name,
                   h.city   AS hospital_city,
                   dep.name AS department_name
            FROM doctors d
            LEFT JOIN hospitals   h   ON h.id   = d.hospital_id
            LEFT JOIN departments dep ON dep.id = d.department_id
            WHERE {' AND '.join(where)}
        """
        doctors = await neon.fetch(sql, *args)

        # Filter by experience minimum
        min_exp = patient_preferences.get("min_experience", 0)
        if min_exp:
            doctors = [d for d in doctors if (d.get("experience_years") or 0) >= min_exp]

        # Filter by max fee
        max_fee = patient_preferences.get("max_fee")
        if max_fee:
            doctors = [d for d in doctors if (d.get("consultation_fee") or 0) <= max_fee]

        # Score and sort
        scored = [(d, self.score_doctor(d, patient_preferences)) for d in doctors]
        scored.sort(key=lambda x: x[1], reverse=True)

        return [d for d, _ in scored[:5]]
