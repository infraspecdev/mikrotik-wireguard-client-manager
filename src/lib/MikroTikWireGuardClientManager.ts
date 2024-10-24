import { AddClientResponse, RemoveClientResponse } from '../types/responses';
import { PeerClient } from "../types/peerClient";
import { SSHClient } from "./MikrotikSSHClient";
import {
    CLIENT_ADD_FAILED,
    CLIENT_ADD_SUCCESS,
    CLIENT_REMOVE_FAILED,
    CLIENT_REMOVE_SUCCESS,
    LIST_CLIENTS_ERROR, NO_CLIENTS_FOUND,
    PARSE_LISTEN_PORT_ERROR,
    PARSE_PUBLIC_KEY_ERROR,
    WIREGUARD_COMMANDS,
    WIREGUARD_FIELDS
} from "../config/constants";


export class MikroTikWireGuardClientManager {
    private sshClient: SSHClient;

    constructor(sshClient: SSHClient) {
        this.sshClient = sshClient;
    }

    public async addClient(publicKey: string, comment: string): Promise<AddClientResponse> {
        try {
            const clientAddress = await this.getNextAvailableIp();
            const command = WIREGUARD_COMMANDS.ADD_PEER(comment, clientAddress, publicKey);
            await this.sshClient.executeCommand(command);

            const wireGuardInfo = await this.getWireGuardInterfaceInfo();
            return {
                success: true,
                message: CLIENT_ADD_SUCCESS,
                config: {
                    clientAddress,
                    routerPublicKey: wireGuardInfo.publicKey,
                    listenPort: wireGuardInfo.listenPort
                }
            };
        } catch (error) {
            return {success: false, message: CLIENT_ADD_FAILED};
        }
    }

    public async removeClient(publicKey: string): Promise<RemoveClientResponse> {
        try {
            const command = WIREGUARD_COMMANDS.REMOVE_PEER(publicKey);
            await this.sshClient.executeCommand(command);
            return {success: true, message: CLIENT_REMOVE_SUCCESS};
        } catch (error) {
            return {success: false, message: CLIENT_REMOVE_FAILED};
        }
    }

    public async listClients(): Promise<PeerClient[]> {
        try {
            const command = WIREGUARD_COMMANDS.LIST_PEERS;
            const output = await this.sshClient.executeCommand(command);

            return this.parseWireGuardPeers(output);
        } catch (error) {
            throw new Error(LIST_CLIENTS_ERROR);
        }
    }

    private parseWireGuardPeers(output: string): PeerClient[] {
        const clients: PeerClient[] = [];
        const lines = output.split('\n');
        let currentComment = '';
        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith(';;;')) {
                currentComment = trimmedLine.slice(4).trim();
            } else if (trimmedLine.length > 0) {
                const parts = trimmedLine.split(/\s+/);
                if (parts.length >= 4) {
                    clients.push({
                        index: parts[0],
                        interface: parts[1],
                        publicKey: parts[2],
                        allowedIp: parts[4],
                        comment: currentComment,
                    });
                }
            }
        });
        return clients;
    }

    private async getWireGuardInterfaceInfo(): Promise<{ publicKey: string; listenPort: number }> {
        const command = WIREGUARD_COMMANDS.GET_INTERFACE_INFO;
        const output = await this.sshClient.executeCommand(command);
        const lines = output.split('\n');
        let publicKey = '';
        let listenPort = 0;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(WIREGUARD_FIELDS.PUBLIC_KEY)) {
                publicKey = trimmedLine.split(WIREGUARD_FIELDS.PUBLIC_KEY)[1].replace(/"/g, '');
            }
            if (trimmedLine.includes(WIREGUARD_FIELDS.LISTEN_PORT)) {
                listenPort = parseInt(trimmedLine.split(WIREGUARD_FIELDS.LISTEN_PORT)[1], 10);
            }
        });

        if (!publicKey) {
            throw new Error(PARSE_PUBLIC_KEY_ERROR);
        }
        if (!listenPort) {
            throw new Error(PARSE_LISTEN_PORT_ERROR);
        }

        return {publicKey, listenPort};
    }

    private async getNextAvailableIp(): Promise<string> {
        const clients = await this.listClients();
        const validClients = clients.filter(client => client.allowedIp.includes('/'));
        if (validClients.length === 0) {
            throw new Error(NO_CLIENTS_FOUND);
        }

        const firstClientIp = validClients[0].allowedIp.split('/')[0];
        const subnet = validClients[0].allowedIp.split('/')[1];
        const baseIp = firstClientIp.split('.').slice(0, 3).join('.');
        const lastOctets = validClients.map(client => parseInt(client.allowedIp.split('.')[3])).sort((a, b) => a - b);
        const nextOctet = (lastOctets[lastOctets.length - 1] || 1) + 1;

        return `${baseIp}.${nextOctet}/${subnet}`;
    }
}