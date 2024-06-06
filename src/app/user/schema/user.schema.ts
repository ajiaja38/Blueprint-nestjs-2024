import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export default class User {
  @Prop({
    type: String,
    unique: true,
    default: () => `user-${uuidv4()}`,
  })
  guid: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    default: null,
    unique: true,
  })
  phoneNumber: string;

  @Prop({
    type: Date,
    default: null,
  })
  birthDate: Date;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: ERole,
  })
  role: ERole;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
