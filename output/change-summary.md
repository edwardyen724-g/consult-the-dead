# Change Summary

## Task

- `b267ab1a` Fix Framework Forge chat CLI default model handling

## Files Changed

- [`framework_forge/chat.py`](/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/framework_forge/chat.py)
- [`tests/test_chat.py`](/Users/haotingyen/projects/consult-the-dead/.wanman/worktree/tests/test_chat.py)

## What Changed

- Replaced the private Anthropic `_default_headers` lookup with the explicit config-backed `MODEL` fallback in `chat_with_framework`.
- Added smoke coverage for the adapter path:
  - prompt assembly includes the core framework elements and only the first eight incidents
  - `chat_with_framework` uses the configured default model when `--model` is omitted
  - `chat_with_framework` honors an explicit `--model` override
  - `chat_with_framework` exits cleanly on `EOFError`, `KeyboardInterrupt`, blank input, and the `quit` path
  - `chat_with_framework` preserves conversation history across turns
  - the `chat` CLI wrapper delegates to `chat_with_framework`
- Removed the unrelated `uv.lock` addition so the PR diff stays code-only.

## Verification

- `PYTHONPATH=. uv run pytest tests/test_chat.py -q`
  - Result: `7 passed`
- `PYTHONPATH=. uv run pytest tests/test_chat.py tests/test_llm.py -q`
  - Result: `14 passed`
- `PYTHONPATH=. uv run pytest tests/test_chat.py --cov=framework_forge --cov-report=term-missing -q`
  - Result: `7 passed`
  - Coverage: `framework_forge/chat.py` at 98%

## Notes

- The repo needs `PYTHONPATH=.` for the test runner to import `framework_forge` from the local worktree.
