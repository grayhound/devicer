import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MatchValidator(
  property: string,
  constraintName?: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: constraintName,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!relatedValue) {
            return true;
          }
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `'${args.property}' field doesn't match '${args.constraints[0]}'`;
        },
      },
    });
  };
}
