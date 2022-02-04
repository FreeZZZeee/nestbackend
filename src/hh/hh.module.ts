import {HttpModule, Module} from '@nestjs/common';
import { HhService } from './hh.service';
import {ConfigModule} from '@nestjs/config';

@Module({
  providers: [HhService],
  imports: [ ConfigModule, HttpModule],
  exports: [HhService]
})
export class HhModule {}
