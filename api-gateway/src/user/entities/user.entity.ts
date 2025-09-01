import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  otpSecret: string | null; // segreto per Google Authenticator, Authy, ecc.

  @Column({ default: false })
  is2faEnabled: boolean;

  @Column({ default: false })
  isVerified: boolean;
}
