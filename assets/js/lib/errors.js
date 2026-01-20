export class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestException';
  }
}

export class NotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundException';
  }
}

export class UnprocessableEntityException extends Error {
  constructor(message, errors) {
    super(message);

    this.name = 'UnprocessableEntityException';
    this.errors = errors;
  }
}

export class InternalServerErrorException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalServerErrorException';
  }
}
