import { randomBytes } from 'crypto';

import { encrypt, decrypt } from '@core/utils/Encryption';

const TEST_SEED_SECRET = '52710696233620282721416465870606';
const TEST_SEED_IV = '9690943835251113';

export class TestCLI {
  constructor() {}

  run(): any {
    const resp = this.testEncryption();

    return resp;
  }

  testEncryption(): boolean {
    const key = randomBytes(32);
    const iv = randomBytes(16);

    const { authTag, encryptedString } = encrypt('test', key, iv);
    console.log('authTag:', authTag, 'encrypted:', encryptedString);

    const decrypted = decrypt(encryptedString, key, iv, authTag);
    console.log('decrypted:', decrypted);

    return true;
  }
}

const testcli = new TestCLI()

console.log(testcli.run());

