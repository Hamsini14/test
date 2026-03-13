import hashlib
import json
from typing import List, Dict, Any

def generate_hash(data: Dict[str, Any]) -> str:
    """Generates a SHA-256 hash for a given dictionary (JSON)."""
    # Sort keys to ensure deterministic hashing
    json_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(json_str.encode('utf-8')).hexdigest()

def build_merkle_tree(hashes: List[str]) -> str:
    """Builds a Merkle tree from a list of hashes and returns the root."""
    if not hashes:
        return ""
    if len(hashes) == 1:
        return hashes[0]

    new_level = []
    # Process pairs, duplicate last if odd number of hashes
    for i in range(0, len(hashes), 2):
        left = hashes[i]
        right = hashes[i + 1] if i + 1 < len(hashes) else left
        combined = left + right
        new_level.append(hashlib.sha256(combined.encode('utf-8')).hexdigest())

    return build_merkle_tree(new_level)
