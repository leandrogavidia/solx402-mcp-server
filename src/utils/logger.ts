export class McpLogger {
    private static isStdioMode(): boolean {
        return process.env.USE_STREAMABLE_HTTP !== "true";
    }

    static log(message: string, ...args: any[]): void {
        if (this.isStdioMode()) {
            process.stderr.write(`[LOG] ${message}${args.length > 0 ? ' ' + args.join(' ') : ''}\n`);
        } else {
            console.log(message, ...args);
        }
    }

    static error(message: string, ...args: any[]): void {
        if (this.isStdioMode()) {
            process.stderr.write(`[ERROR] ${message}${args.length > 0 ? ' ' + args.join(' ') : ''}\n`);
        } else {
            console.error(message, ...args);
        }
    }

    static warn(message: string, ...args: any[]): void {
        if (this.isStdioMode()) {
            process.stderr.write(`[WARN] ${message}${args.length > 0 ? ' ' + args.join(' ') : ''}\n`);
        } else {
            console.warn(message, ...args);
        }
    }

    static info(message: string, ...args: any[]): void {
        if (this.isStdioMode()) {
            process.stderr.write(`[INFO] ${message}${args.length > 0 ? ' ' + args.join(' ') : ''}\n`);
        } else {
            console.info(message, ...args);
        }
    }
}