import { randomUUID } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

import { LogProvider } from '@core/providers/LogProvider';
import { cryptoOptions } from '@core/crypto/CryptoOptions';
import { toMs } from '@core/utils/Utils';

const NAME = 'JWT Provider';
const SECRET = randomUUID(cryptoOptions);
export const TIMESPAN = toMs.min(15);
const minInDay = 1440;
export const REFRESHTIMESPAN = toMs.min(minInDay) * 30;

/*
  JWT provider, wrapping jsonwebtoken

  Performs basic signing and checking within range

  Will only work on systems where the key was generated
*/

export class JwtProvider {
  private log = new LogProvider(NAME);
  constructor(private secret = SECRET) {
    this.log.initFileLogger();
  }

  async sign(userId: string, secret?: string, timeSpan = TIMESPAN): Promise<string> {
    return await new Promise( (resolve, reject) => {
      try {
        this.log.getFileSystem().info('Signing JWT');
        const signedJwt = sign({ id: userId }, secret || this.secret, { expiresIn: timeSpan });
        return resolve(signedJwt);
      } catch (err) {
        this.log.getFileSystem().error('Error signing JWT');
        return reject(err);
      }
    })
  }

  async verified(token: string, secret?: string): Promise<{ token: string, verified: boolean}> {
    return await new Promise( (resolve, reject) => {
      try {
        const decodedJwt = verify(token, secret || this.secret, { complete: true });
        if (decodedJwt) {
          return resolve({ token, verified: true });
        }
      } catch (err) { return reject(err); }
    })
  }
}