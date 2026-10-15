#!/usr/bin/env bash
# PreToolUse hook — blocks agent access to secret files.
# Matcher: Read|Edit|Write|Grep

INPUT=$(cat)

# Read/Edit/Write use "file_path"; Grep uses "path"
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

BASENAME=$(basename "$FILE_PATH")

case "$BASENAME" in
    .env|.env.prod|.env.local|.env.test|id_rsa|id_ed25519|*.pem|*.key|*.p12|credentials.json|token.json)
        echo "Blocked: $FILE_PATH is a protected secret file." >&2
        echo "Agents must not read or modify secret files." >&2
        exit 2
        ;;
esac

exit 0
