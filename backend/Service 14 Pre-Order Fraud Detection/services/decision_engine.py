def make_decision(final_score):
    if final_score <= 30:
        return "Approve", "Low"
    elif final_score <= 60:
        return "OTP Verification", "Medium"
    elif final_score <= 80:
        return "Manual Review", "High"
    else:
        return "Reject", "Critical"
