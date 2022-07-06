import { createCipheriv, createDecipheriv } from 'crypto';

import { LogProvider } from '@core/providers/LogProvider';

const encryptionLog = new LogProvider('Encryption Utils')

export const encrypt = (data: any, secret: any, iv: any) => {
  try {
    const cipher = createCipheriv('aes-256-gcm', secret, iv);
    const encryptedString = `${cipher.update(JSON.stringify(data), 'utf-8', 'hex')}${cipher.final('hex')}`;
    
    return {
      authTag: cipher.getAuthTag().toString('hex'),
      encryptedString
    }
  } catch (err) {
    encryptionLog.error(`[ENCRYPTION] Error Stack => ${err}`);
    throw err;
  }
}

export const decrypt = (data: string, secret: any, iv: any, authTag: string) => {
  try {
    const decipher = createDecipheriv('aes-256-gcm', secret, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    return `${decipher.update(data, 'hex', 'utf-8')}${decipher.final('utf-8')}`
  } catch (err) {
    encryptionLog.error(`[DECRYPTION] Error Stack => ${err}`);
    throw err;
  }
}

export const convertBaseSystem = (inputData: string, newBase: number) => {
  const chunkSubstring = (str: string, size: number) => {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    for (let chunk = 0, index = 0; chunk < numChunks; chunk++, index += size) {
      chunks[chunk] = str.substring(index, size);
    }

    return chunks;
  }

  const inputArr = chunkSubstring(inputData, newBase);

}