#!/usr/bin/env bash
# PostToolUse hook — auto-formats files after Claude edits them.
# Matcher: Edit|Write

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only act on source files
case "$FILE_PATH" in
    *.astro|*.ts|*.js|*.mjs|*.css|*.json)
        ;;
    *)
        exit 0
        ;;
esac

# Only act on files inside src/ or project root configs
if [[ "$FILE_PATH" != */src/* ]] && [[ "$FILE_PATH" != */site.config.mjs ]] && [[ "$FILE_PATH" != */astro.config.mjs ]]; then
    exit 0
fi

# Format silently with npx prettier — failure does not block
# Determine which sub-project the file belongs to
PROJECT_DIR=$(echo "$FILE_PATH" | grep -oP '.*/(?:site|blog|mission)/')

if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR" && npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi

exit 0
