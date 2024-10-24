import {executeSSHCommand} from "../utils/ssh";

export interface SSHClient {
  executeCommand(command: string): Promise<string>;
}

export class MikroTikSSHClient implements SSHClient {
  private readonly host: string;
  private readonly port: number;
  private readonly username: string;
  private readonly password: string;

  constructor(host: string, port: number, username: string, password: string) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
  }

  public async executeCommand(command: string): Promise<string> {
    return await executeSSHCommand(command, this.host, this.port, this.username, this.password);
  }
}
