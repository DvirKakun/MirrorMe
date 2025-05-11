# backend/tools.py
import time, uuid

REPORT_DB = {}  # in-memory simulation; swap with real DB


def diagnose_risk(text: str) -> dict:
    tl = text.lower()
    if any(w in tl for w in ["hit", "kick", "choke", "knife"]):
        return {"risk_level": "high", "score": 90}
    if any(w in tl for w in ["afraid", "scared", "threaten"]):
        return {"risk_level": "medium", "score": 60}
    return {"risk_level": "low", "score": 25}


RESOURCE_INDEX = {
    "tel aviv": {"hotline": "118", "shelter": "Safe Haven – Rothschild 12"},
    "jerusalem": {"hotline": "02-123-4567", "shelter": "Women’s Center – Yafo 99"},
}


def find_local_resources(location: str) -> dict:
    return RESOURCE_INDEX.get(
        location.lower(),
        {
            "hotline": "118 (national)",
            "shelter": "Call hotline to locate nearest shelter.",
        },
    )


def save_report(report: str) -> dict:
    rid = str(uuid.uuid4())[:8]
    REPORT_DB[rid] = {"text": report, "ts": time.time()}
    return {"status": "saved", "report_id": rid}
