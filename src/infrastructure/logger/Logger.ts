type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private readonly context: string;

  constructor(context: string) { this.context = context; }

  debug(msg: string, data?: unknown): void { this.log("debug", msg, data); }
  info(msg: string, data?: unknown): void  { this.log("info", msg, data); }
  warn(msg: string, data?: unknown): void  { this.log("warn", msg, data); }
  error(msg: string, data?: unknown): void { this.log("error", msg, data); }

  private log(level: LogLevel, msg: string, data?: unknown): void {
    if (process.env.NODE_ENV === "production" && level === "debug") return;
    const prefix = `[${level.toUpperCase()}] [${this.context}]`;
    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    logFn(prefix, msg, data ?? "");
  }
}
