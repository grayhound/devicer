import { AbstractTransformPipe } from './abstract-transform.pipe';

export class TrimStringsPipe extends AbstractTransformPipe {
  except() {
    return [
      'password',
      'passwordCheck',
      'oldPassword',
      'newPassword',
      'newPasswordCheck',
    ];
  }

  protected transformValue(value: any) {
    return typeof value === 'string' ? value.trim() : value;
  }
}
