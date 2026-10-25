/**
 * PactFlow Word-Level Diff Engine
 * Computes token-level insertions and deletions using Longest Common Subsequence (LCS)
 */

function tokenize(text) {
  if (!text) return [];
  // Tokenize preserving whitespace and punctuation
  return text.match(/\S+|\s+/g) || [];
}

function computeWordDiff(oldText, newText) {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  const m = oldTokens.length;
  const n = newTokens.length;

  // Build DP table for LCS
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff chunks
  let i = m;
  let j = n;
  const rawDiff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      rawDiff.push({ type: 'unchanged', value: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({ type: 'added', value: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({ type: 'removed', value: oldTokens[i - 1] });
      i--;
    }
  }

  rawDiff.reverse();

  // Consolidate adjacent tokens of same type
  const consolidated = [];
  for (const token of rawDiff) {
    const last = consolidated[consolidated.length - 1];
    if (last && last.type === token.type) {
      last.value += token.value;
    } else {
      consolidated.push({ type: token.type, value: token.value });
    }
  }

  return consolidated;
}

module.exports = { computeWordDiff };
