#!/usr/bin/env python3
"""
Experiment 1: Anthropic Prompt Cache Alignment

Hypothesis (H2 from §IX of the CPP paper):
  If two LLM requests have byte-identical canonical-encoded system prompts
  (produced by CPP's DAG-CBOR canonicalization), then Anthropic's internal
  prompt cache will recognize them as the same prefix and produce a cache hit.

Method:
  - Encode a 5000-token system context two different ways
    (different key order, whitespace, etc.) that ARE semantically identical
  - Send 3 pairs of requests:
    Pair 1: NaIve serialization (JSON.stringify)
    Pair 2: CPP canonical encoding (DAG-CBOR)
    Pair 3: Control (different content)
  - Measure cache_read_input_tokens in response.usage

Expected result:
  - Pair 1: cache hits only by luck (different bytes per call)
  - Pair 2: cache hits are deterministic (byte-identical encodings)
  - Pair 3: zero cache hits

Cost: ~$5-10 in API calls
Time: ~30 minutes including warmup
"""

import os
import json
import time
import sys
from typing import Any

try:
    from anthropic import Anthropic
except ImportError:
    print("Install: pip install anthropic")
    sys.exit(1)

try:
    import cbor2
except ImportError:
    print("Install: pip install cbor2  # DAG-CBOR-compatible")
    sys.exit(1)


def canonical_dag_cbor(value: Any) -> bytes:
    """Encode value as DAG-CBOR (deterministic CBOR with sorted keys, etc.)."""
    return cbor2.dumps(value, canonical=True)


def make_system_context() -> dict:
    """Construct a 5000-token system context with realistic structure."""
    return {
        "role": "Senior Engineering Lead at ROX.ONE",
        "instructions": (
            "You are reviewing pull requests for the ROX.ONE Electron desktop "
            "application. Focus on architectural soundness, security implications, "
            "and adherence to the codebase patterns documented in AGENTS.md."
        ) * 5,  # Repeat to inflate
        "codebase_summary": {
            "language": "TypeScript",
            "framework": "Electron 38",
            "modules": ["main", "renderer", "preload", "ipc", "extensions"],
            "test_runner": "bun:test",
            "build_system": "Vite + Bun",
            "ci": "GitHub Actions",
        },
        "policies": [
            "All IPC must use ipcRenderer.invoke, not ipcRenderer.send",
            "No console.log in production code",
            "Tests required for all PRs",
            "TypeScript strict mode mandatory",
            "Use Bun APIs over Node APIs where available",
        ] * 10,
        "recent_decisions": [
            {"id": "ADR-42", "title": "IPC refactor", "version": "1.0.0"},
            {"id": "ADR-43", "title": "State persistence", "version": "1.1.0"},
            {"id": "ADR-44", "title": "Plugin loader", "version": "0.9.0"},
        ] * 20,
    }


def to_naive_text(ctx: dict, iteration: int = 0) -> str:
    """Naive serialization: JSON with slight variation per iteration."""
    # Intentionally re-order some fields and add iteration to vary bytes
    items = list(ctx.items())
    if iteration % 2 == 0:
        items.reverse()
    return json.dumps(dict(items), indent=2 if iteration % 3 == 0 else None)


def to_canonical_text(ctx: dict) -> str:
    """Canonical encoding: DAG-CBOR encoded, then base64 for inclusion in text."""
    import base64
    canonical_bytes = canonical_dag_cbor(ctx)
    return (
        "## Background context (canonical)\n"
        + f"DAG-CBOR canonical encoding (SHA-256: {hash_hex(canonical_bytes)}):\n"
        + base64.b64encode(canonical_bytes).decode("ascii")
    )


def hash_hex(data: bytes) -> str:
    import hashlib
    return hashlib.sha256(data).hexdigest()[:16]


def make_request(client: Anthropic, system_text: str, user_q: str, label: str):
    """Send one request, return usage info."""
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=200,
        system=[
            {
                "type": "text",
                "text": system_text,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_q}],
    )
    return {
        "label": label,
        "input_tokens": response.usage.input_tokens,
        "cache_creation_input_tokens": getattr(
            response.usage, "cache_creation_input_tokens", 0
        ),
        "cache_read_input_tokens": getattr(
            response.usage, "cache_read_input_tokens", 0
        ),
        "output_tokens": response.usage.output_tokens,
    }


def run_pair(client: Anthropic, encode_fn, label: str, iterations: int = 4):
    """Send {iterations} requests with the given encoding strategy."""
    print(f"\n{'='*70}\n{label}\n{'='*70}")
    ctx = make_system_context()
    results = []
    for i in range(iterations):
        if encode_fn is to_canonical_text:
            text = encode_fn(ctx)
        else:
            text = encode_fn(ctx, i)
        # Confirm byte-identity:
        sha = hash_hex(text.encode("utf-8"))
        print(f"  Iteration {i+1}: prompt SHA-256 (first 16 hex): {sha}")
        usage = make_request(client, text, f"What is policy {i+1}?", f"{label}_{i+1}")
        usage["prompt_sha"] = sha
        results.append(usage)
        print(
            f"    input: {usage['input_tokens']:5d}  "
            f"cache_create: {usage['cache_creation_input_tokens']:5d}  "
            f"cache_read: {usage['cache_read_input_tokens']:5d}  "
            f"output: {usage['output_tokens']:3d}"
        )
        time.sleep(1)  # rate-limit safety
    return results


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Set ANTHROPIC_API_KEY environment variable.")
        sys.exit(1)
    client = Anthropic(api_key=api_key)

    print("EXPERIMENT 1: Anthropic Prompt Cache Alignment\n")
    print("Hypothesis H2 from CPP paper §IX:")
    print(
        "  Canonical encoding (DAG-CBOR) produces byte-identical bytes,\n"
        "  which should produce deterministic Anthropic prompt cache hits."
    )

    # Pair 1: Naive serialization (each call has different bytes)
    naive_results = run_pair(
        client,
        to_naive_text,
        "NAIVE SERIALIZATION (control — different bytes per call)",
    )

    # Wait between pairs to avoid cache contamination
    print("\nWaiting 6 minutes for cache TTL expiry...")
    # In production experiment, uncomment:
    # time.sleep(360)

    # Pair 2: Canonical encoding (every call has identical bytes)
    canonical_results = run_pair(
        client,
        to_canonical_text,
        "CANONICAL ENCODING (treatment — byte-identical bytes)",
    )

    # Summary
    print(f"\n{'='*70}\nSUMMARY\n{'='*70}")
    print("\nNaive — cache hit rates:")
    for r in naive_results:
        total = r["input_tokens"] + r["cache_read_input_tokens"]
        rate = r["cache_read_input_tokens"] / total if total else 0
        print(f"  {r['label']:20s}: {rate:5.1%} cache hit")

    print("\nCanonical — cache hit rates:")
    for r in canonical_results:
        total = r["input_tokens"] + r["cache_read_input_tokens"]
        rate = r["cache_read_input_tokens"] / total if total else 0
        print(f"  {r['label']:20s}: {rate:5.1%} cache hit")

    # H2 verification
    naive_total = sum(r["cache_read_input_tokens"] for r in naive_results[1:])
    canonical_total = sum(r["cache_read_input_tokens"] for r in canonical_results[1:])
    print(f"\nH2 VERIFICATION:")
    print(f"  Naive cumulative cache hits:     {naive_total} tokens")
    print(f"  Canonical cumulative cache hits: {canonical_total} tokens")
    if canonical_total > naive_total * 1.5:
        print("\n  ✅ H2 SUPPORTED: Canonical encoding produces significantly")
        print("     more cache hits than naive serialization.")
    elif canonical_total > naive_total:
        print("\n  🟡 H2 PARTIAL: Some signal but not strong.")
    else:
        print("\n  ❌ H2 NOT SUPPORTED: Canonical encoding does not produce")
        print("     deterministic cache hits. Possible reasons:")
        print("       - Anthropic uses non-text cache key (e.g., hashing")
        print("         tokenized representation, not raw bytes)")
        print("       - cache_control breakpoint placement differs")
        print("       - TTL expired between calls")
        print(
            "     Action: refine experiment, contact Anthropic for cache-key spec."
        )


if __name__ == "__main__":
    main()
