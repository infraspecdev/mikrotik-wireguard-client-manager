import { MikroTikWireGuardClientManager } from '../lib/MikroTikWireGuardClientManager';
import { SSHClient } from '../lib/MikrotikSSHClient';
import { AddClientResponse, RemoveClientResponse } from '../types/responses';
import { PeerClient } from '../types/peerClient';

const mockSSHClient: SSHClient = {
  executeCommand: jest.fn(),
};

describe('MikroTikWireGuardClientManager', () => {
  let manager: MikroTikWireGuardClientManager;

  beforeEach(() => {
    manager = new MikroTikWireGuardClientManager(mockSSHClient);
    jest.spyOn(manager, 'listClients');
  });

  it('should add a client successfully', async () => {
    const publicKey = 'testPublicKey';
    const comment = 'Test Comment';
    const mockIp = '192.168.1.2/24';

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce('output with public key');
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (manager as any).getNextAvailableIp = jest.fn().mockResolvedValue(mockIp);
    (manager as any).getWireGuardInterfaceInfo = jest.fn().mockResolvedValue({ publicKey: 'routerPublicKey', listenPort: 51820 });

    const response: AddClientResponse = await manager.addClient(publicKey, comment);

    expect(response.success).toBe(true);
    expect(response.message).toBe('VPN client added successfully');
    expect(response.config).toEqual({ clientAddress: mockIp, routerPublicKey: 'routerPublicKey', listenPort: 51820 });
    expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(expect.stringContaining(comment));
  });

  it('should fail to add a client and return an error message', async () => {
    const publicKey = 'testPublicKey';
    const comment = 'Test Comment';

    (mockSSHClient.executeCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

    const response: AddClientResponse = await manager.addClient(publicKey, comment);

    expect(response.success).toBe(false);
    expect(response.message).toContain('VPN client added failed:Error: Error listing VPN clients');
  });

  it('should remove a client successfully', async () => {
    const publicKey = 'testPublicKey';

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce('output');

    const response: RemoveClientResponse = await manager.removeClient(publicKey);

    expect(response.success).toBe(true);
    expect(response.message).toBe('VPN client removed successfully');
    expect(mockSSHClient.executeCommand).toHaveBeenCalledWith(expect.stringContaining(publicKey));
  });

  it('should fail to remove a client and return an error message', async () => {
    const publicKey = 'testPublicKey';

    (mockSSHClient.executeCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

    const response: RemoveClientResponse = await manager.removeClient(publicKey);

    expect(response.success).toBe(false);
    expect(response.message).toContain('VPN client removal failed:Error: Command failed');
  });

  // New test cases

  it('should list clients successfully', async () => {
    const mockOutput = `
      index interface publicKey endpoint-port allowedIp
      ;;; Test-Comment
      0 wg0 testPublicKey 0 192.168.1.2/24
    `;

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce(mockOutput);

    const clients: PeerClient[] = await manager.listClients();

    expect(clients.length).toBe(2);
    expect(clients[1]).toEqual({
      index: '0',
      interface: 'wg0',
      publicKey: 'testPublicKey',
      allowedIp: '192.168.1.2/24',
      comment: 'Test-Comment',
    });
  });

  it('should throw an error when listing clients fails', async () => {
    (mockSSHClient.executeCommand as jest.Mock).mockRejectedValue(new Error('Command failed'));

    await expect(manager.listClients()).rejects.toThrow('Error listing VPN clients');
  });

  it('should parse wireguard peers correctly', () => {
    const mockOutput = `
      index interface publicKey endpoint-port allowedIp
      ;;; Test-Comment
      0 wg0 testPublicKey 0 192.168.1.2/24
    `;

    const clients = manager['parseWireGuardPeers'](mockOutput);

    expect(clients.length).toBe(2);
    expect(clients[1]).toEqual({
      index: '0',
      interface: 'wg0',
      publicKey: 'testPublicKey',
      allowedIp: '192.168.1.2/24',
      comment: 'Test-Comment',
    });
  });

  it('should return an empty array if there are no clients to parse', () => {
    const mockOutput = '';

    const clients = manager['parseWireGuardPeers'](mockOutput);

    expect(clients.length).toBe(0);
  });

  it('should get wireguard interface info successfully', async () => {
    const mockOutput = `
      Flags: X - disabled; R - running
 0  R name="wg0" mtu=1420 listen-port=51820 private-key="routerPrivateKey" public-key="routerPublicKey"
    `;

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce(mockOutput);

    const info = await manager['getWireGuardInterfaceInfo']();

    expect(info).toEqual({ publicKey: 'routerPublicKey', listenPort: 51820 });
  });

  it('should throw an error if the public key is missing', async () => {
    const mockOutput = `
      Listen Port: 51820
    `;

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce(mockOutput);

    await expect(manager['getWireGuardInterfaceInfo']()).rejects.toThrow('Failed to retrieve public-key from the WireGuard interface output');
  });

  it('should throw an error if the listen port is missing', async () => {
    const mockOutput = `
      Flags: X - disabled; R - running
 0  R name="wg0" mtu=1420 private-key="routerPrivateKey" public-key="routerPublicKey"
    `;

    (mockSSHClient.executeCommand as jest.Mock).mockResolvedValueOnce(mockOutput);

    await expect(manager['getWireGuardInterfaceInfo']()).rejects.toThrow('Failed to retrieve listen-port from the WireGuard interface output');
  });

  it('should get the next available IP successfully', async () => {
    const mockClients: PeerClient[] = [
      { index: '0', interface: 'wg0', publicKey: 'testPublicKey', allowedIp: '192.168.1.2/24', comment: 'Test Comment' },
      { index: '1', interface: 'wg0', publicKey: 'testPublicKey', allowedIp: '192.168.1.3/24', comment: 'Test Comment' },
    ];

    (manager.listClients as jest.Mock).mockResolvedValueOnce(mockClients);
    const nextIp = await manager['getNextAvailableIp']();

    expect(nextIp).toBe('192.168.1.4/24');
  });

  it('should throw an error when getting the next available IP if no clients are found', async () => {
    (manager.listClients as jest.Mock).mockResolvedValueOnce([]);

    await expect(manager['getNextAvailableIp']()).rejects.toThrow('No valid IP addresses found from the clients.');
  });
});
