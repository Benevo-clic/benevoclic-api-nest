import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsGeoPoint(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isGeoPoint',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          return (
            typeof value === 'object' &&
            value?.type === 'Point' &&
            Array.isArray(value.coordinates) &&
            value.coordinates.length === 2 &&
            value.coordinates.every(n => typeof n === 'number' && !isNaN(n)) &&
            value.coordinates[0] >= -180 &&
            value.coordinates[0] <= 180 &&
            value.coordinates[1] >= -90 &&
            value.coordinates[1] <= 90
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} doit être un GeoJSON Point [lng, lat] valide`;
        },
      },
    });
  };
}
