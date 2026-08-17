function formatTokenCount(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return String(n);
  if (n < 1000) return String(Math.round(n));
  const thousands = n / 1000;
  const rounded = Math.round(thousands * 10) / 10;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${str}k`;
}

function formatCost(usd) {
  if (typeof usd !== 'number' || !Number.isFinite(usd)) return null;
  return `~$${usd.toFixed(2)}`;
}

const RESET = '\x1b[0m';
const COLORS = {
  green: '\x1b[38;5;10m',
  yellow: '\x1b[38;5;11m',
  orange: '\x1b[38;5;208m',
  red: '\x1b[38;5;9m',
};

function colorForPercentage(pct) {
  if (pct <= 20) return COLORS.green;
  if (pct <= 60) return COLORS.yellow;
  if (pct <= 80) return COLORS.orange;
  return COLORS.red;
}

function buildStatusLine(data) {
  const parts = [];
  const cw = data && data.context_window;

  if (
    cw &&
    Number.isFinite(cw.total_input_tokens) &&
    Number.isFinite(cw.context_window_size) &&
    Number.isFinite(cw.used_percentage)
  ) {
    const color = colorForPercentage(Math.round(cw.used_percentage));
    const tokenStr = `${formatTokenCount(cw.total_input_tokens)}/${formatTokenCount(cw.context_window_size)} tokens (${Math.round(cw.used_percentage)}%)`;
    parts.push(`${color}${tokenStr}${RESET}`);
  }

  const costUsd = data && data.cost && data.cost.total_cost_usd;
  const costStr = formatCost(costUsd);
  if (costStr) parts.push(costStr);

  if (parts.length === 0) return 'token-usage-monitor: no data';
  return parts.join(' ');
}

module.exports = {
  formatTokenCount,
  formatCost,
  colorForPercentage,
  RESET,
  buildStatusLine,
};

const MAX_INPUT_BYTES = 1024 * 1024; // 1MB — far more than the small JSON payload Claude Code sends; guards against unbounded stdin

function main() {
  let input = '';
  let tooLarge = false;
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    if (tooLarge) return;
    input += chunk;
    if (input.length > MAX_INPUT_BYTES) {
      tooLarge = true;
      process.stdout.write('token-usage-monitor: no data\n');
      process.stdin.destroy();
    }
  });
  process.stdin.on('end', () => {
    if (tooLarge) return;
    let data;
    try {
      data = JSON.parse(input);
    } catch (err) {
      process.stdout.write('token-usage-monitor: no data\n');
      return;
    }
    process.stdout.write(buildStatusLine(data) + '\n');
  });
  process.stdin.on('error', () => {
    if (tooLarge) return;
    process.stdout.write('token-usage-monitor: no data\n');
  });
}

if (require.main === module) {
  main();
}
