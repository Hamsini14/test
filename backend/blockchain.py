from typing import Optional
import datetime
import hashlib

class BlockchainMock:
    """
    Mock implementation of Algorand interaction for local hackathon testing.
    Simulates anchoring a Merkle root to the blockchain.
    """
    def __init__(self):
        self.transactions = {}
        self.system_status = "SAFE" # SAFE or HALTED (Stage 9: Circuit Breaker)

    def anchor_merkle_root(self, batch_id: str, merkle_root: str, system_id: str = "AI_SYSTEM_01") -> str:
        """
        Stage 7: Blockchain Anchoring.
        Returns a mock transaction ID.
        """
        tx_id = "TX_" + hashlib.sha256(f"{batch_id}{merkle_root}{datetime.datetime.utcnow().timestamp()}".encode()).hexdigest()
        
        self.transactions[tx_id] = {
            "batch_id": batch_id,
            "merkle_root": merkle_root,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "system_id": system_id
        }
        print(f"Anchored Merkle Root {merkle_root} to mock blockchain. TX ID: {tx_id}")
        return tx_id
        
    def get_transaction(self, tx_id: str) -> Optional[dict]:
        return self.transactions.get(tx_id)
        
    def get_system_status(self) -> str:
        """Stage 9: Smart Contract Circuit Breaker state."""
        return self.system_status
        
    def halt_system(self):
        """Trigger circuit breaker."""
        import traceback
        import sys
        traceback.print_stack(file=sys.stderr)
        print("SYSTEM HALTED WAS CALLED!", file=sys.stderr)
        self.system_status = "HALTED"

# Singleton instance
blockchain_client = BlockchainMock()
