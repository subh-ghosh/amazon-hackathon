from app.services.simulator import SimulationEngine
from app.models.schemas import SimulationRequest

def test_scenario_ranking():
    engine = SimulationEngine()
    
    # Perfect condition, low fraud, high trust -> Should be Restock As New
    req_perfect = SimulationRequest(
        returnId="1", productId="1", category="Cat",
        conditionScore=100, utilityScore=100, fraudScore=0,
        estimatedValue=1000.0, returnReason="Unwanted", sellerTrustScore=1.0
    )
    res_perfect = engine.run_simulation(req_perfect)
    assert res_perfect.bestScenario == "Restock As New"
    
    # Bad condition -> Restock should be excluded, might be Outlet or Refurbish
    req_bad = SimulationRequest(
        returnId="2", productId="2", category="Cat",
        conditionScore=50, utilityScore=50, fraudScore=0,
        estimatedValue=1000.0, returnReason="Damaged", sellerTrustScore=0.5
    )
    res_bad = engine.run_simulation(req_bad)
    scenarios = [s.scenario for s in res_bad.simulations]
    assert "Restock As New" not in scenarios
    assert "Outlet Sale" not in scenarios # Outlet requires condition >= 0.6
    
    # Horrible condition -> Only Recycle, Donate, or RTV
    req_horrible = SimulationRequest(
        returnId="3", productId="3", category="Cat",
        conditionScore=10, utilityScore=10, fraudScore=50,
        estimatedValue=100.0, returnReason="Destroyed", sellerTrustScore=0.1
    )
    res_horrible = engine.run_simulation(req_horrible)
    scenarios = [s.scenario for s in res_horrible.simulations]
    assert "Restock As New" not in scenarios
    assert "Refurbish" not in scenarios
    assert "Outlet Sale" not in scenarios
