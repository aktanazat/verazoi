import math


def glucose_score(readings: list[dict]) -> float:
    """CV + TIR + mean penalty. Max 35 pts."""
    if len(readings) < 2:
        return 50.0

    values = [float(r["value"]) for r in readings]
    mean = sum(values) / len(values)
    if mean <= 0:
        return 50.0

    variance = sum((v - mean) ** 2 for v in values) / len(values)
    sd = math.sqrt(variance)
    cv = (sd / mean) * 100

    in_range = [v for v in values if 70 <= v <= 140]
    tir = len(in_range) / len(values)

    if mean < 70:
        mean_penalty = (70 - mean) * 0.4
    elif mean <= 110:
        mean_penalty = 0
    elif mean <= 140:
        mean_penalty = (mean - 110) * 0.15
    else:
        mean_penalty = 4.5 + (mean - 140) * 0.3

    if cv < 20:
        cv_score = 30.0
    elif cv < 36:
        cv_score = 30 - (cv - 20) * (15 / 16)
    else:
        cv_score = max(0, 15 - (cv - 36) * 0.5)

    tir_score = min(30, tir * 30 / 0.7)
    return max(0, min(35, cv_score + tir_score - mean_penalty))


def activity_score(activities: list[dict], wearable_steps: int | None, wearable_active_min: int | None) -> float:
    """WHO moderate-equivalent minutes. Max 25 pts."""
    total = 0.0
    multipliers = {"light": 0.5, "moderate": 1.0, "intense": 2.0}
    for a in activities:
        m = multipliers.get(a.get("intensity", "moderate").lower(), 1.0)
        total += a.get("duration", 0) * m

    if wearable_active_min is not None:
        total = max(total, float(wearable_active_min))

    if wearable_steps is not None and wearable_steps > 5000:
        total += (wearable_steps - 5000) / 1000 * 3

    return min(1.0, total / 30) * 25


def sleep_score(sleep_entries: list[dict], wearable_sleep_hours: float | None) -> float:
    """Duration + quality. Max 20 pts."""
    if wearable_sleep_hours and wearable_sleep_hours > 0:
        hours = wearable_sleep_hours
        quality = sleep_entries[-1]["quality"] if sleep_entries else "fair"
    elif sleep_entries:
        hours = sleep_entries[-1]["hours"]
        quality = sleep_entries[-1]["quality"]
    else:
        return 10.0

    if 7 <= hours <= 9:
        dur = 15.0
    elif hours >= 6:
        dur = 15 - (7 - hours) * 5
    else:
        dur = max(0, 15 - (7 - hours) * 7)

    qm = {"great": 1.0, "good": 0.85, "fair": 0.6, "poor": 0.4}.get(quality, 0.4)
    return min(20, dur * qm + 5 * qm)


def heart_rate_score(resting_hr: int | None) -> float:
    """Max 20 pts."""
    if resting_hr is None:
        return 10.0
    if resting_hr <= 60:
        return 20.0
    if resting_hr <= 72:
        return 20 - (resting_hr - 60) * (5.0 / 12.0)
    if resting_hr <= 85:
        return 15 - (resting_hr - 72) * (5.0 / 13.0)
    return max(0, 10 - (resting_hr - 85) * 0.5)


def spike_risk(readings: list[dict], activities: list[dict], sleep_entries: list[dict],
               wearable_hr: int | None, wearable_active_min: int | None,
               wearable_sleep_hours: float | None) -> dict:
    risk = 0.3
    factors = []

    recent = [r["value"] for r in readings[-3:]]
    if len(recent) >= 2:
        trend = recent[-1] - recent[0]
        if trend > 20:
            risk += 0.15
            factors.append({"label": f"Rising glucose trend (+{int(trend)} mg/dL)", "impact": "high", "weight": 0.15})

    if readings and readings[-1]["value"] > 130:
        v = readings[-1]["value"]
        risk += 0.12
        factors.append({"label": f"Elevated current glucose ({v} mg/dL)", "impact": "high", "weight": 0.12})

    sleep_h = wearable_sleep_hours or (sleep_entries[-1]["hours"] if sleep_entries else 7)
    if sleep_h < 6:
        risk += 0.1
        factors.append({"label": f"Sleep deficit ({sleep_h:.1f} hrs)", "impact": "moderate", "weight": 0.1})

    active_min = wearable_active_min or sum(a.get("duration", 0) for a in activities)
    if active_min < 15:
        risk += 0.08
        factors.append({"label": "Low activity today", "impact": "moderate", "weight": 0.08})

    if wearable_hr and wearable_hr > 80:
        risk += 0.05
        factors.append({"label": f"Elevated heart rate ({wearable_hr} bpm)", "impact": "moderate", "weight": 0.05})

    if not factors:
        factors.append({"label": "No major risk factors", "impact": "low", "weight": 0})

    factors.sort(key=lambda f: f["weight"], reverse=True)
    return {"probability": min(0.95, max(0.05, risk)), "factors": factors}


def calculate(
    readings: list[dict],
    activities: list[dict],
    sleep_entries: list[dict],
    wearable_hr: int | None = None,
    wearable_steps: int | None = None,
    wearable_active_min: int | None = None,
    wearable_sleep_hours: float | None = None,
) -> dict:
    g = glucose_score(readings)
    a = activity_score(activities, wearable_steps, wearable_active_min)
    s = sleep_score(sleep_entries, wearable_sleep_hours)
    h = heart_rate_score(wearable_hr)
    raw = g + a + s + h
    score = max(0, min(100, round(raw)))

    risk = spike_risk(readings, activities, sleep_entries, wearable_hr, wearable_active_min, wearable_sleep_hours)

    return {
        "score": score,
        "glucose_component": round(g, 2),
        "activity_component": round(a, 2),
        "sleep_component": round(s, 2),
        "heart_rate_component": round(h, 2),
        "spike_risk": round(risk["probability"], 3),
        "spike_factors": risk["factors"],
    }
