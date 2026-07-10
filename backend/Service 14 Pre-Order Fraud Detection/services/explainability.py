def generate_explanation(reasons, ml_prob):
    expl = list(reasons)
    if ml_prob > 0.7:
        expl.append("AI Model detected high probability of fraudulent patterns.")
    return expl
