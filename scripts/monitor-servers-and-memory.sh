#!/bin/bash
# monitor-servers-and-memory.sh
# Monitors backend/frontend server PIDs and system memory/swap usage.
# Usage: ./monitor-servers-and-memory.sh <backend_pid> <frontend_pid>

BACKEND_PID=$1
FRONTEND_PID=$2

if [ -z "$BACKEND_PID" ] || [ -z "$FRONTEND_PID" ]; then
  echo "Usage: $0 <backend_pid> <frontend_pid>"
  exit 1
fi

# Thresholds (adjust as needed)
LOW_MEM_MB=500      # Warn if free memory below this (MB)
HIGH_SWAP_MB=2048   # Warn if swap used above this (MB)

function check_process() {
  local pid=$1
  if ! ps -p $pid > /dev/null; then
    return 1
  fi
  return 0
}

function get_free_mem_mb() {
  # macOS: vm_stat returns pages, page size is usually 4096 or 16384 bytes
  local free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
  local page_size=$(vm_stat | grep "page size of" | awk '{print $8}')
  local free_mem_mb=$((free_pages * page_size / 1024 / 1024))
  echo $free_mem_mb
}

function get_swap_used_mb() {
  local swap_used=$(sysctl vm.swapusage | awk '{print $7}' | cut -d'M' -f1)
  echo ${swap_used%.*}
}

while true; do
  # Check backend
  if ! check_process $BACKEND_PID; then
    echo "[ALERT] Backend server (PID $BACKEND_PID) is NOT running!" >&2
  fi
  # Check frontend
  if ! check_process $FRONTEND_PID; then
    echo "[ALERT] Frontend server (PID $FRONTEND_PID) is NOT running!" >&2
  fi
  # Check memory
  FREE_MEM=$(get_free_mem_mb)
  if [ "$FREE_MEM" -lt "$LOW_MEM_MB" ]; then
    echo "[WARNING] Low free memory: ${FREE_MEM}MB left!" >&2
  fi
  # Check swap
  SWAP_USED=$(get_swap_used_mb)
  if [ "$SWAP_USED" -gt "$HIGH_SWAP_MB" ]; then
    echo "[WARNING] High swap usage: ${SWAP_USED}MB used!" >&2
  fi
  # Print status
  echo "[INFO] Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID | Free Mem: ${FREE_MEM}MB | Swap Used: ${SWAP_USED}MB"
  sleep 10
  echo "---"
done 