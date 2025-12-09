export function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  ).replace("::ffff:", "");
}
