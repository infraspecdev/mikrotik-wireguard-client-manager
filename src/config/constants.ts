export const WIREGUARD_COMMANDS = {
    ADD_PEER: (comment: string, allowedAddress: string, key: string) =>
        `/interface wireguard peers add comment="${comment}" allowed-address=${allowedAddress} interface=wg0 public-key="${key}"`,
    REMOVE_PEER: (key: string) => `/interface wireguard peers remove [find public-key="${key}"]`,
    LIST_PEERS: `/interface wireguard peers print`,
    GET_INTERFACE_INFO: `/interface wireguard print`,
};

export const WIREGUARD_FIELDS = {
    LISTEN_PORT: 'listen-port=',
    PUBLIC_KEY: 'public-key='
}

export const CLIENT_ADD_SUCCESS = 'VPN client added successfully';

export const CLIENT_REMOVE_SUCCESS = 'VPN client removed successfully';

export const CLIENT_ADD_FAILED = 'VPN client added failed';

export const CLIENT_REMOVE_FAILED = 'VPN client removal failed';

export const LIST_CLIENTS_ERROR = 'Error listing VPN clients';

export const PARSE_LISTEN_PORT_ERROR = 'Failed to retrieve listen-port from the WireGuard interface output';

export const PARSE_PUBLIC_KEY_ERROR = 'Failed to retrieve public-key from the WireGuard interface output';

export const NO_CLIENTS_FOUND = "No valid IP addresses found from the clients.";