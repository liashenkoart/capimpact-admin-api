import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';

import { VDIndustryTreeService } from '../services';


export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const PORT = Number(process.env.VD_TREE_SOCKET_PORT);

@WebSocketGateway(PORT)
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private treeSrv: VDIndustryTreeService) {}

    @WebSocketServer() server;
    async handleConnection(client) { }

    async handleDisconnect() {}

    @SubscribeMessage('cloneIndustryParent')
    async cloneIndustryParent(client, body) {
      return await this.treeSrv.cloneIndustry(body,client)
    }
  }