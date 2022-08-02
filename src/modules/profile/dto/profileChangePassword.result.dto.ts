import { Expose } from 'class-transformer';

/**
 * Result for `/profile/changePassword` endpoint
 */
export class ProfileChangePasswordResultDto {
  @Expose()
  message = 'User password changed successfully';
}
