#!/usr/bin/env bash
# Vérifie le format Conventional Commits du titre d'une PR et de chacun de ses commits (ADR 0009).
# Format : type(zone): résumé   (zone facultative, « ! » avant « : » pour un changement cassant)
# Utilisable en local : BASE_SHA=origin/main HEAD_SHA=HEAD PR_TITLE="feat: …" scripts/check-conventional-commits.sh
set -euo pipefail

PATTERN='^(feat|fix|perf|refactor|docs|test|ci|build|chore|revert)(\([a-z0-9-]+\))?!?: [^ ].*'
failures=0

check() {
  local label="$1" subject="$2"
  if [[ "$subject" =~ $PATTERN ]]; then
    echo "ok      $label : $subject"
  else
    echo "::error::$label hors format « type(zone): résumé » : $subject"
    failures=$((failures + 1))
  fi
}

if [[ -n "${PR_TITLE:-}" ]]; then
  check "titre de la PR" "$PR_TITLE"
fi

while IFS=' ' read -r sha subject; do
  [[ -z "$sha" ]] && continue
  check "commit ${sha:0:7}" "$subject"
done < <(git log --no-merges --format='%H %s' "${BASE_SHA:?BASE_SHA manquant}..${HEAD_SHA:?HEAD_SHA manquant}")

if (( failures > 0 )); then
  echo "$failures message(s) à corriger. Types admis : feat fix perf refactor docs test ci build chore revert."
  exit 1
fi
