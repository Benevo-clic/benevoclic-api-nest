import { Module } from '@nestjs/common';
import { SessionController } from './controllers/session.controller';
import { FirebaseAdminService } from '../../common/firebase/firebaseAdmin.service';

@Module({
  controllers: [SessionController],
  providers: [
    {
      provide: FirebaseAdminService,
      useFactory: () => FirebaseAdminService.getInstance(),
    },
  ],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
