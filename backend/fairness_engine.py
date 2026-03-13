import json
from typing import List, Dict, Any, Optional

def generate_counterfactual_variations(input_data: Dict[str, Any], model_type: str = "loan") -> List[Dict[str, Any]]:
    """
    Generate 2-3 controlled variations of the input by slightly modifying one feature at a time.
    """
    variations = []
    if model_type == "loan":
        # Variation 1: Credit Score +/- 10
        score = input_data.get("credit_score", 650)
        variations.append({**input_data, "credit_score": max(300, min(850, score - 10))})
        variations.append({**input_data, "credit_score": max(300, min(850, score + 10))})
        
        # Variation 2: Income +/- 5%
        income = input_data.get("income", 50000)
        variations.append({**input_data, "income": income * 0.95})
        variations.append({**input_data, "income": income * 1.05})
    elif model_type == "stock":
        # Variation 1: Price +/- 1%
        price = input_data.get("current_price", 100)
        variations.append({**input_data, "current_price": price * 0.99})
        variations.append({**input_data, "current_price": price * 1.01})
        
        # Variation 2: RSI +/- 5
        rsi = input_data.get("rsi_14", 50)
        variations.append({**input_data, "rsi_14": max(0, min(100, rsi - 5))})
        variations.append({**input_data, "rsi_14": max(0, min(100, rsi + 5))})
    
    # Return 3 distinct variations
    return variations[:3]

def run_fairness_test(original_decision: str, variant_decisions: List[str]) -> Dict[str, Any]:
    """
    Compare variant decisions with the original decision.
    """
    flips = [d for d in variant_decisions if d != original_decision]
    stability_score = 1.0 - (len(flips) / len(variant_decisions)) if variant_decisions else 1.0
    
    return {
        "stability_score": round(stability_score, 2),
        "variations_tested": len(variant_decisions),
        "flips_detected": len(flips),
        "status": "PASS" if stability_score > 0.7 else "WARNING"
    }

def compute_bias_metrics(records: List[Dict[str, Any]], model_type: str = "loan") -> Dict[str, Any]:
    """
    Analyze stored execution records for distribution bias.
    """
    alerts = []
    distribution = {}
    
    if not records:
        return {"bias_alerts": [], "fairness_score": 100.0, "distribution_data": {}}

    if model_type == "loan":
        # Analyze by credit score bands
        bands = {
            "Poor (<550)": [0, 550],
            "Fair (550-650)": [550, 650],
            "Good (650-750)": [650, 750],
            "Excellent (>750)": [750, 1000]
        }
        
        for name, (low, high) in bands.items():
            band_records = [r for r in records if low <= r.get("credit_score", 0) < high]
            if not band_records:
                continue
                
            rejections = [r for r in band_records if "Reject" in r.get("decision", "")]
            rejection_rate = len(rejections) / len(band_records)
            
            distribution[name] = round(rejection_rate * 100, 2)
            
            if rejection_rate > 0.8:
                alerts.append({
                    "segment": name,
                    "metric": "Rejection Rate",
                    "value": f"{round(rejection_rate * 100, 2)}%",
                    "message": f"Suspiciously high rejection rate in {name} segment."
                })
    
    elif model_type == "stock":
        # Analyze by Ticker or price range
        tickers = list(set([r.get("ticker") for r in records if r.get("ticker")]))
        for ticker in tickers:
            ticker_records = [r for r in records if r.get("ticker") == ticker]
            sells = [r for r in ticker_records if r.get("decision") == "SELL"]
            sell_rate = len(sells) / len(ticker_records)
            
            distribution[ticker] = round(sell_rate * 100, 2)
            
            if sell_rate > 0.8:
                alerts.append({
                    "segment": ticker,
                    "metric": "Sell Rate",
                    "value": f"{round(sell_rate * 100, 2)}%",
                    "message": f"High sell-bias detected for {ticker}."
                })

    # Simple Fairness Score: 100 - (10 for each alert)
    score = max(0, 100 - (len(alerts) * 10))
    
    return {
        "bias_alerts": alerts,
        "fairness_score": float(score),
        "distribution_data": distribution
    }
