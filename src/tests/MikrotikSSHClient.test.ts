import { MikroTikSSHClient } from '../lib/MikrotikSSHClient';
import { executeSSHCommand } from '../utils/ssh';

jest.mock('../utils/ssh');

describe('MikroTikSSHClient', () => {
  const host = '192.168.1.1';
  const port = 22;
  const username = 'admin';
  const password = 'password';
  let client: MikroTikSSHClient;

  beforeEach(() => {
    client = new MikroTikSSHClient(host, port, username, password);
  });

  it('should execute a command successfully', async () => {
    const command = 'test command';
    (executeSSHCommand as jest.Mock).mockResolvedValue('command output');

    const result = await client.executeCommand(command);

    expect(result).toBe('command output');
    expect(executeSSHCommand).toHaveBeenCalledWith(command, host, port, username, password);
  });

  it('should throw an error when the command fails', async () => {
    const command = 'test command';
    (executeSSHCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

    await expect(client.executeCommand(command)).rejects.toThrow('Command failed');
  });
});
