export enum MODE {
  DEVELOP = 'DEV',
  PRODUCTION = 'PROD',
  TEST = 'TEST',
}

export enum LOG_LEVEL {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum PROMISE_ALL_STATUS {
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}
export const TimeZoneHeader = 'time-zone';
export const UserAttemptKey = 'user-attempt';
export const AcceptedUserStage = 'accepted-user-stage';

export const ResponseMessageKey = 'message';

export const TokenCookieKey = 'token';

export const accessTokenHeaderKey = 'access-token';

export const csrfTokenHeaderKey = 'csrf-token';

export const googleAuthCodeHeaderKey = 'google-auth-code';

export const authCodeHeaderKey = 'auth-code';

export const methodHeaderKey = 'method';

export const methodHeaderKeyEnum = ['APPLE', 'GOOGLE'];

export const apiKeyHeaderKey = 'x-api-key';

export const TokenExpiredErrorKey = 'TokenExpiredError';

export const SigninApiOkResponseDescription =
  'Response comes with <b>access-token</b> header and <b>token</b> cookie';

export const alphabetWithSpacesBetween = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

export const IGNORE_TRIM_STRING_PIPE_KEY = 'ignoreTrimStringPipe';

export const IGNORE_EMPTY_STRING_TO_NULL_PIPE_KEY =
  'ignoreEmptyStringToNullPipe';

export const roleGuardInputKey = 'role';

export const planGuardInputKey = 'plan';

export const DEFAULT_API_VERSION = '1';

export enum TOKEN_CACHE_KEY_POSTFIX {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export const TYPESENSE_CLIENT = 'TYPESENSE_CLIENT';
