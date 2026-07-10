def apply_rules(features):
    score = 0
    reasons = []

    if features["return_rate"] > 50:
        score += 30
        reasons.append("Return rate exceeds 50%")
    
    if features["account_age"] < 30:
        score += 20
        reasons.append("Account is less than 30 days old")
        
    if features["order_value"] > 50000:
        score += 15
        reasons.append("Order value unusually high (₹50,000+)")
        
    if features["shared_device"] > 2:
        score += 15
        reasons.append("Device linked with multiple accounts")
        
    if features["shared_address"] > 2:
        score += 10
        reasons.append("Address linked with multiple accounts")
        
    if features["fraud_flags"] > 0:
        score += 20
        reasons.append("Previous fraud flags detected")

    return min(score, 100), reasons
