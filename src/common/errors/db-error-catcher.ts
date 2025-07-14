import { QueryFailedError } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { HttpBadRequestException } from 'src/common/errors/index';
abstract class DbErrors {
  abstract uniqueViolationCode: string;
  violatesUnique(error: QueryFailedError & { code?: string }) {
    return error?.code === this.uniqueViolationCode;
  }
}
class postgresErrors extends DbErrors {
  uniqueViolationCode = '23505';
}

@Injectable()
export class DbErrorCatcher {
  private readonly errorCodes: DbErrors = new postgresErrors();
  throw(error: QueryFailedError): Error {
    if (this.errorCodes.violatesUnique(error)) {
      throw new HttpBadRequestException('Already exists');
    }
    throw error;
  }
}
