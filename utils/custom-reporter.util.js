export default class {
  onTestEnd(test) {
    const symbol = test.details.passed
      ? "\x1b[32m✓\x1b[0m"
      : "\x1b[31m✖\x1b[0m";
    console.log(`${symbol} ${test.name} (${test.details.duration_ms}ms)`);
    if (!test.details.passed) console.log("   " + test.details.error.message);
  }
}
