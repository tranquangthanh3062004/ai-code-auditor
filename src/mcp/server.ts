import readline from 'node:readline';
import { MCP_TOOLS, executeMcpTool } from './tools.js';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class McpServer {
  private serverInfo = {
    name: 'codetrust-mcp-server',
    version: '0.2.0',
  };

  public start(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const req: JsonRpcRequest = JSON.parse(trimmed);
        const res = await this.handleRequest(req);
        if (res) {
          process.stdout.write(JSON.stringify(res) + '\n');
        }
      } catch (err: any) {
        const errResponse: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${err.message}`,
          },
        };
        process.stdout.write(JSON.stringify(errResponse) + '\n');
      }
    });

    process.stderr.write(`[CodeTrust MCP Server] Sẵn sàng lắng nghe trên stdio (v${this.serverInfo.version})\n`);
  }

  public async handleRequest(req: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    const { id, method, params } = req;

    switch (method) {
      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: this.serverInfo,
            capabilities: {
              tools: {},
            },
          },
        };
      }

      case 'notifications/initialized': {
        // Notification, no reply expected
        return null;
      }

      case 'ping': {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {},
        };
      }

      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            tools: MCP_TOOLS,
          },
        };
      }

      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};

        if (!toolName) {
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            error: {
              code: -32602,
              message: 'Invalid params: thiếu "name"',
            },
          };
        }

        try {
          const toolResult = await executeMcpTool(toolName, toolArgs);
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(toolResult, null, 2),
                },
              ],
            },
          };
        } catch (err: any) {
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result: {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: `Lỗi thực thi tool "${toolName}": ${err.message}`,
                },
              ],
            },
          };
        }
      }

      default: {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          error: {
            code: -32601,
            message: `Method not found: "${method}"`,
          },
        };
      }
    }
  }
}
