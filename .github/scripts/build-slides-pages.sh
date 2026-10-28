#!/usr/bin/env bash
set -euo pipefail

root="$(pwd)"
output="$root/pages-dist"
base="${PAGES_BASE_PATH?Set PAGES_BASE_PATH to the Pages base path (or an empty string)}"
base="${base%/}"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT

if [[ -e "$output" ]]; then
  echo "::error::Output directory already exists: $output"
  exit 1
fi

git tag --list 'published/*' --sort=refname > "$temporary/tags"
while IFS= read -r tag; do
  version="${tag#published/}"
  if [[ ! "$version" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]]; then
    echo "::error::Invalid version path for tag: $tag (use letters, digits, dots, hyphens or underscores)"
    exit 1
  fi
done < "$temporary/tags"

build_slides() {
  (
    cd "$1"
    npm ci
    npm run build -- --base "$2/" --out "$3"
    node "$root/.github/scripts/create-slides-routes.mjs" "$3"
  )
}

build_slides "$root/slides" "$base" "$output"

while IFS= read -r tag; do
  version="${tag#published/}"
  if [[ -e "$output/$version" ]]; then
    echo "::error::Version path conflicts with an existing build entry: $version"
    exit 1
  fi

  echo "::group::Building $tag"
  source="$temporary/$version"
  mkdir -p "$source"
  source_paths=(slides)
  if [[ -n "$(git ls-tree "$tag" -- images)" ]]; then
    source_paths+=(images)
  fi
  git archive "$tag" "${source_paths[@]}" | tar -x -C "$source"
  build_slides "$source/slides" "$base/$version" "$output/$version"
  echo "::endgroup::"
done < "$temporary/tags"
