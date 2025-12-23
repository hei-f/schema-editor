#!/bin/sh

# 加载 NVM 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🔍 Running TypeScript type check..."
bunx tsgo --incremental --noEmit
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ TypeScript type check failed. Please fix the errors above before pushing."
  exit $EXIT_CODE
fi

echo "✅ TypeScript type check passed."

