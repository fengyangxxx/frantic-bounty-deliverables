#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

rm -rf receipts
mkdir -p receipts

npm --prefix /tmp/noble -s install @noble/curves@1.4.2 >/dev/null

SEED="$(
  node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64'))"
)"
PUB="$(
  SEED="$SEED" NODE_PATH=/tmp/noble/node_modules node - <<'NODE'
const { ed25519 } = require('@noble/curves/ed25519');
const seed = Buffer.from(process.env.SEED, 'base64');
process.stdout.write(Buffer.from(ed25519.getPublicKey(seed)).toString('base64'));
NODE
)"

printf "%s\n" "$PUB" > receipt-public-key-base64.txt

npx -y @runxhq/cli@0.6.13 --version | tee runx-version.txt

export RUNX_RECEIPT_SIGN_ED25519_SEED_BASE64="$SEED"
export RUNX_RECEIPT_SIGN_KID=frantic33-scafld-validation-key
export RUNX_RECEIPT_SIGN_ISSUER_TYPE=hosted

npx -y @runxhq/cli@0.6.13 skill . \
  --input public_url=https://0state.com/scafld/docs/go-api \
  --input parent_url=https://0state.com/scafld \
  --input repo_url=https://github.com/nilstate/scafld \
  --input commit=ce26b0c0637a0f0acd1c6be4397bda14668844ec \
  --input min_pages=20 \
  --json | tee skill-run-output-linux.json

npx -y @runxhq/cli@0.6.13 harness . --receipt-dir ./receipts --json | tee harness-output.json

RECEIPT="$(
  node -e "const h=require('./harness-output.json'); process.stdout.write(h.receipt_ids[0])"
)"

export RUNX_RECEIPT_VERIFY_KID=frantic33-scafld-validation-key
export RUNX_RECEIPT_VERIFY_ED25519_PUBLIC_KEY_BASE64="$PUB"

npx -y @runxhq/cli@0.6.13 verify "$RECEIPT" --receipt-dir ./receipts --json | tee receipt-verify-output.json
