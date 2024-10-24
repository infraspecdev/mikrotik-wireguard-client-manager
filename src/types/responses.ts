import {ClientConfig} from "./clientConfig";

export interface AddClientResponse {
  success: boolean;
  message: string;
  config?: ClientConfig;
}

export interface RemoveClientResponse {
  success: boolean;
  message: string;
}
