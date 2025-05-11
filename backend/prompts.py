# A minimal in-code prompt library; you can also load from YAML
PROMPTS = {
    "opening": [
        "Hi, I’m here to listen whenever you feel ready 💜",
        "Thank you for reaching out. How are you feeling today?",
    ],
    "reflection": [
        "Sometimes it helps to look at specific moments. Can we talk about a recent incident?",
        "May I ask you a few gentle questions so we can reflect together?",
    ],
    "danger_check": [
        "Do you feel physically unsafe right now?",
        "Has your partner ever threatened or harmed you or someone you love?",
    ],
    "denial_stage": [
        "Many people in your situation doubt the seriousness. Do you ever find yourself minimizing what happened?",
        "It’s common to second-guess your own experiences. Do you sometimes worry you’re overreacting?",
    ],
}

SEED_SYSTEM = (
    "You are MirrorMe, an empathetic, trauma-informed assistant. "
    "You understand the cycle of abuse (tension → incident → reconciliation → calm) and "
    "that denial is a natural stage. Always validate feelings, ask open questions, "
    "and choose among tools: diagnose_risk, find_local_resources, or save_report."
)
