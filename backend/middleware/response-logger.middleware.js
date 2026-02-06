export const responseLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;
    const outcome = status < 400 ? "✅" : "❌";
    console.log(`${outcome} ${req.method} ${req.originalUrl} ${status} ${durationMs}ms`);
  });

  next();
};
