import { ProfileDeleteTest } from './delete.test';
import { ProfileGetTest } from './get.test';
import { ProfilePatchTest } from './patch.test';
import { ProfilePutTest } from './put.test';
import { ProfilePostTest } from './post.test';

export const ProfileTests = {
  delete: ProfileDeleteTest,
  get: ProfileGetTest,
  patch: ProfilePatchTest,
  put: ProfilePutTest,
  post: ProfilePostTest,
};
