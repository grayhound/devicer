import { SignupDeleteTest } from './delete.test';
import { SignupGetTest } from './get.test';
import { SignupPatchTest } from './patch.test';
import { SignupPutTest } from './put.test';
import { SignupPostTest } from './post.test';

export const SignupTests = {
  delete: SignupDeleteTest,
  get: SignupGetTest,
  patch: SignupPatchTest,
  put: SignupPutTest,
  post: SignupPostTest,
};
