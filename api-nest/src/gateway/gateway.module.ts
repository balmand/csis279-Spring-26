import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AppDataService } from './app-data.service';
import { GatewayResolver } from './gateway.resolver';
import { JsonScalar } from './json.scalar';

@Module({
  providers: [GatewayResolver, JsonScalar, DatabaseService, AppDataService],
})
export class GatewayModule {}
