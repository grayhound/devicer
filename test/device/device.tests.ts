import { DeviceDeleteTest } from './delete.test';
import { DeviceGetTest } from './get.test';
import { DevicePatchTest } from './patch.test';
import { DevicePutTest } from './put.test';
import { DevicePostTest } from './post.test';
import { DeviceGetListTest } from './getList.test';

export const DeviceTests = {
  delete: DeviceDeleteTest,
  get: DeviceGetTest,
  patch: DevicePatchTest,
  put: DevicePutTest,
  post: DevicePostTest,
  getList: DeviceGetListTest,
};
