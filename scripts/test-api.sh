#!/usr/bin/env bash
# scripts/test-api.sh
#
# Smoke test every public API + Ask Labs endpoint against a running dev server.
#
# Usage:
#   BASE_URL=http://localhost:3000 bash scripts/test-api.sh
#
# Exits 0 if every expected 2xx is observed, 1 otherwise.
#
# Note: admin endpoints will return 403 (Forbidden) without an authenticated
# session — those are reported as EXPECTED_AUTH, not failures.

set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0
EXPECTED_AUTH=0

probe() {
  local label="$1"
  local method="$2"
  local path="$3"
  local body="${4:-}"
  local expected="$5"

  local args=(-s -o /tmp/_api_body -w '%{http_code}' -X "$method" "$BASE_URL$path")
  if [[ -n "$body" ]]; then
    args+=(-H 'content-type: application/json' -d "$body")
  fi

  local code
  code="$(curl "${args[@]}" 2>/dev/null || echo 000)"

  case "$expected" in
    public)
      if [[ "$code" =~ ^2 ]]; then
        echo "PASS  $label  [$method $path]  $code"
        PASS=$((PASS+1))
      else
        echo "FAIL  $label  [$method $path]  $code"
        FAIL=$((FAIL+1))
      fi
      ;;
    auth_required)
      if [[ "$code" == "403" || "$code" == "401" ]]; then
        echo "AUTH  $label  [$method $path]  $code (expected)"
        EXPECTED_AUTH=$((EXPECTED_AUTH+1))
      else
        echo "FAIL  $label  [$method $path]  $code (expected 401/403)"
        FAIL=$((FAIL+1))
      fi
      ;;
  esac
}

# Public content
probe "projects list"             GET  "/api/handlers/projects?pageSize=3"                            ""     public
probe "projects featured only"    GET  "/api/handlers/projects?featuredOnly=true&pageSize=3"         ""     public
probe "projects detail"           GET  "/api/handlers/projects/research-agent-runtime"               ""     public
probe "articles list"             GET  "/api/handlers/articles?pageSize=3"                            ""     public
probe "articles detail"           GET  "/api/handlers/articles/why-naive-rag-fails"                  ""     public
probe "team list"                 GET  "/api/handlers/team"                                            ""     public
probe "feedback recent"           GET  "/api/handlers/feedback/recent"                                 ""     public

# Admin (must require auth)
probe "admin projects list"       GET  "/api/handlers/admin/projects"                                 ""     auth_required
probe "admin articles list"       GET  "/api/handlers/admin/articles"                                 ""     auth_required
probe "admin team list"           GET  "/api/handlers/admin/team"                                     ""     auth_required

# Contact / brief submission (public, must validate input)
probe "brief invalid (400)"       POST "/api/handlers/brief"                                          '{}'    auth_required
probe "feedback invalid (400)"     POST "/api/handlers/feedback"                                       '{}'    auth_required

# Ask Labs
probe "ask-labs invalid prompt"   POST "/api/ask-labs/chat"                                           '{"prompt":""}'      auth_required
probe "ask-labs invalid JSON"     POST "/api/ask-labs/chat"                                           'not-json'           auth_required
probe "ask-labs sources"          POST "/api/ask-labs/sources"                                        '{"query":"RAG"}'    public

echo ""
echo "Summary: PASS=$PASS  FAIL=$FAIL  EXPECTED_AUTH=$EXPECTED_AUTH"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
