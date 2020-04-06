import * as crypto from 'crypto';

class Password {
  encrypt(password: string) {
    const salt = this._generateSalt(8);
    return this._generateHash('sha256', salt, password);
  }

  verify(password: string, hashedPassword: string) {
    if (!password || !hashedPassword) {
      return false;
    }
    const [algorithm, salt] = hashedPassword.split('$');
    return this._generateHash(algorithm, salt, password) === hashedPassword;
  }

  _generateHash(algorithm: string, salt: string, password: string) {
    const hash = crypto
      .createHmac(algorithm, salt)
      .update(password)
      .digest('hex');
    return [algorithm, salt, hash].join('$');
  }

  _generateSalt(length = 8) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}

export default new Password();
