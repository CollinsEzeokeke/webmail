#!/usr/bin/env bash
# =============================================================================
# Nexa Webmail - Deploy Script
# SSHes into your server, pulls latest code, rebuilds, and restarts via PM2.
#
# Usage:
#   bash deploy.sh            # deploy
#   bash deploy.sh --dry-run  # preview what would run (no changes)
#
# Windows: run from Git Bash, WSL, or any terminal where `ssh` is available.
# =============================================================================
set -euo pipefail

# =============================================================================
# CONFIG — fill these in before first use
# =============================================================================
SSH_USER="ubuntu"                        # your server username
SSH_HOST="your.server.com"              # server hostname or IP address
SSH_KEY=""                               # path to SSH key, e.g. ~/.ssh/id_rsa (leave blank to use default)
REMOTE_DIR="/var/www/nexa-webmail"      # absolute path to the project on the server
PM2_APP_NAME="nexa-webmail"             # name of your PM2 process (check with: pm2 list)
BRANCH="main"                            # branch to pull
# =============================================================================

# -- CLI flags ----------------------------------------------------------------
DRY_RUN=false
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        -h|--help)
            echo "Usage: bash deploy.sh [--dry-run]"
            echo "  --dry-run   Show what would run without executing"
            exit 0 ;;
    esac
done

# -- Colors -------------------------------------------------------------------
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'

OK="${GREEN}[OK]${RESET}"
FAIL="${RED}[!!]${RESET}"
WARN="${YELLOW}[!!]${RESET}"
INFO="${CYAN}>>>${RESET}"

# -- Helpers ------------------------------------------------------------------
step() { echo -e "\n${CYAN}${BOLD}==> $*${RESET}"; }
ok()   { echo -e "    ${OK}  $*"; }
fail() { echo -e "    ${FAIL} $*"; exit 1; }
warn() { echo -e "    ${WARN} $*"; }
info() { echo -e "    ${INFO} $*"; }

# -- Validate config ----------------------------------------------------------
validate_config() {
    local errors=0
    [[ "$SSH_USER" == "ubuntu" && "$SSH_HOST" == "your.server.com" ]] && \
        warn "SSH_USER / SSH_HOST look like placeholders — edit deploy.sh before running."
    [[ -z "$SSH_HOST" ]] && { warn "SSH_HOST is not set."; errors=$(( errors + 1 )); }
    [[ -z "$SSH_USER" ]] && { warn "SSH_USER is not set."; errors=$(( errors + 1 )); }
    [[ -z "$REMOTE_DIR" ]] && { warn "REMOTE_DIR is not set."; errors=$(( errors + 1 )); }
    [[ -z "$PM2_APP_NAME" ]] && { warn "PM2_APP_NAME is not set."; errors=$(( errors + 1 )); }
    [[ $errors -gt 0 ]] && fail "Fix the config block at the top of deploy.sh and try again."
}

# Build the SSH command (with or without a key override)
ssh_cmd() {
    if [[ -n "$SSH_KEY" ]]; then
        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${SSH_USER}@${SSH_HOST}" "$@"
    else
        ssh -o StrictHostKeyChecking=accept-new "${SSH_USER}@${SSH_HOST}" "$@"
    fi
}

# -- Banner -------------------------------------------------------------------
echo ""
echo -e "${CYAN}${BOLD}+----------------------------------+${RESET}"
echo -e "${CYAN}${BOLD}|   Nexa Webmail  --  Deploy       |${RESET}"
echo -e "${CYAN}${BOLD}+----------------------------------+${RESET}"
echo ""
info "Target : ${BOLD}${SSH_USER}@${SSH_HOST}${RESET}"
info "Dir    : ${BOLD}${REMOTE_DIR}${RESET}"
info "Branch : ${BOLD}${BRANCH}${RESET}"
info "PM2    : ${BOLD}${PM2_APP_NAME}${RESET}"
[[ "$DRY_RUN" == true ]] && echo -e "\n  ${YELLOW}${BOLD}-- DRY RUN -- no commands will be executed --${RESET}"

validate_config

# -- Connectivity check -------------------------------------------------------
step "Checking SSH connectivity"
if [[ "$DRY_RUN" == true ]]; then
    info "[dry-run] Would run: ssh ${SSH_USER}@${SSH_HOST} echo ok"
else
    if ssh_cmd "echo ok" &>/dev/null; then
        ok "Connected to ${SSH_HOST}"
    else
        fail "Cannot reach ${SSH_HOST}. Check SSH credentials and network."
    fi
fi

# -- Remote deployment --------------------------------------------------------
step "Running deployment on ${SSH_HOST}"

REMOTE_SCRIPT=$(cat << 'REMOTE_EOF'
set -euo pipefail

BOLD='\033[1m'; RESET='\033[0m'; GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; DIM='\033[2m'
OK="${GREEN}[OK]${RESET}"; FAIL="${RED}[!!]${RESET}"; INFO="${CYAN}>>>${RESET}"

step() { echo -e "\n  ${CYAN}${BOLD}$*${RESET}"; }
ok()   { echo -e "    ${OK}  $*"; }
fail() { echo -e "    ${FAIL} $*"; exit 1; }

REMOTE_DIR="__REMOTE_DIR__"
BRANCH="__BRANCH__"
PM2_APP_NAME="__PM2_APP_NAME__"

cd "$REMOTE_DIR" || fail "Directory not found: $REMOTE_DIR"

step "Pulling latest code (branch: $BRANCH)"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
COMMIT=$(git log -1 --format='%h %s')
ok "At commit: $COMMIT"

step "Installing dependencies"
pnpm install --frozen-lockfile
ok "pnpm install done"

step "Building"
pnpm run build
ok "Build complete"

step "Restarting PM2 process"
if pm2 describe "$PM2_APP_NAME" &>/dev/null; then
    pm2 restart "$PM2_APP_NAME" --update-env
    ok "PM2 process '$PM2_APP_NAME' restarted"
else
    echo -e "    ${CYAN}>>>${RESET} Process '$PM2_APP_NAME' not found — starting fresh"
    pm2 start pnpm --name "$PM2_APP_NAME" -- start
    pm2 save
    ok "PM2 process '$PM2_APP_NAME' started and saved"
fi

echo ""
echo -e "  ${GREEN}${BOLD}Deploy complete!${RESET}"
echo -e "  ${DIM}Run 'pm2 logs $PM2_APP_NAME' on the server to watch live output.${RESET}"
REMOTE_EOF
)

# Substitute placeholders
REMOTE_SCRIPT="${REMOTE_SCRIPT//__REMOTE_DIR__/$REMOTE_DIR}"
REMOTE_SCRIPT="${REMOTE_SCRIPT//__BRANCH__/$BRANCH}"
REMOTE_SCRIPT="${REMOTE_SCRIPT//__PM2_APP_NAME__/$PM2_APP_NAME}"

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo -e "  ${DIM}[dry-run] Would execute on ${SSH_HOST}:${RESET}"
    echo ""
    echo "$REMOTE_SCRIPT" | sed 's/^/    /'
else
    ssh_cmd "bash -s" <<< "$REMOTE_SCRIPT"
fi

echo ""
echo -e "${CYAN}${BOLD}+----------------------------------+${RESET}"
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${CYAN}${BOLD}|   Dry run complete               |${RESET}"
else
    echo -e "${GREEN}${BOLD}|   Deployment successful!         |${RESET}"
fi
echo -e "${CYAN}${BOLD}+----------------------------------+${RESET}"
echo ""
