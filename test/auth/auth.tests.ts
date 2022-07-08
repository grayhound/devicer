import { AuthDeleteTest } from './delete.test';
import { AuthGetTest } from './get.test';
import { AuthPatchTest } from './patch.test';
import { AuthPutTest } from './put.test';
import { AuthPostTest } from './post.test';

export const AuthTests = {
  delete: AuthDeleteTest,
  get: AuthGetTest,
  patch: AuthPatchTest,
  put: AuthPutTest,
  post: AuthPostTest,
};
