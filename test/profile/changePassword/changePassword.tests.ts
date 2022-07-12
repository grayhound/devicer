import { ProfileChangePasswordDeleteTest } from './delete.test';
import { ProfileChangePasswordGetTest } from './get.test';
import { ProfileChangePasswordPatchTest } from './patch.test';
import { ProfileChangePasswordPutTest } from './put.test';
import { ProfileChangePasswordPostTest } from './post.test';

export const ChangePasswordTests = {
  delete: ProfileChangePasswordDeleteTest,
  get: ProfileChangePasswordGetTest,
  patch: ProfileChangePasswordPatchTest,
  put: ProfileChangePasswordPutTest,
  post: ProfileChangePasswordPostTest,
};
