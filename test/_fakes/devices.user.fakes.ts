import { faker } from '@faker-js/faker';

interface FakeUser {
  email: string;
  password: string;
  passwordCheck: string;
}

export function createFakeUser(): FakeUser {
  const password = faker.internet.password();
  return {
    email: faker.internet.email(),
    password,
    passwordCheck: password,
  };
}
