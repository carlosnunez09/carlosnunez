#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/.*HUGO_VERSION = "\([^"]*\)"/\1/p' netlify.toml)
if [ -x .tools/hugo/hugo ] && .tools/hugo/hugo version | grep -q "v${version}-"; then
  .tools/hugo/hugo version
  exit 0
fi
case "$(uname -s)/$(uname -m)" in
  Darwin/*) platform=darwin-universal ;;
  Linux/x86_64) platform=linux-amd64 ;;
  Linux/aarch64|Linux/arm64) platform=linux-arm64 ;;
  *) echo 'Unsupported platform; install Hugo manually.' >&2; exit 1 ;;
esac
mkdir -p .tools/hugo
archive="hugo_${version}_${platform}.tar.gz"
curl -fL "https://github.com/gohugoio/hugo/releases/download/v${version}/${archive}" -o .tools/hugo/archive.tar.gz
tar -xzf .tools/hugo/archive.tar.gz -C .tools/hugo hugo
.tools/hugo/hugo version
