#!/usr/bin/env bash
# PreToolUse hook — blocks Claude from editing its own settings and hooks.
# Prevents prompt injection from disabling the guardrails.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED=(
  ".claude/settings.json"
  ".claude/settings.local.json"
  ".claude/hooks/"
)

for pattern in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH is a protected configuration file." >&2
    echo "To change Claude Code settings, edit the file directly in your editor." >&2
    exit 2
  fi
done

exit 0
