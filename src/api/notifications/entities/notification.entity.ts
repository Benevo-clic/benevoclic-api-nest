import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';
import {
    NotificationType,
    RecipientType,
} from '../interfaces/notification.interface';

@Entity('notifications')
@Index(['recipientId', 'isRead'])
@Index(['recipientId', 'createdAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    recipientId: string;

    @Column({ type: 'enum', enum: RecipientType })
    recipientType: RecipientType;

    @Column('text')
    message: string;

    @Column({ nullable: true })
    redirectUrl: string;

    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ nullable: true })
    entityId: string;

    @Column({ nullable: true })
    entityName: string;

    @CreateDateColumn()
    createdAt: Date;
}
