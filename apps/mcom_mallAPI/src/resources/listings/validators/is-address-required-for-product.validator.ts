import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateBusinessDto } from '../dto/listings.dto';
import { ListingType } from '../listing.enum';

@ValidatorConstraint({ name: 'isAddressRequired', async: false })
class IsAddressRequiredConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CreateBusinessDto;
    if (object.listingType.includes(ListingType.PRODUCT)) {
      if (!value) {
        return false;
      }
      if (!value.addressLine1 || !value.city || !value.postcode) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Location with addressLine1, city, and postcode is required for product listings.';
  }
}

export function IsAddressRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAddressRequiredConstraint,
    });
  };
}
