import { validateRegister, validateLogin } from '../../middlewares/validationMiddleware.js';

describe('validateRegister', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Normal cases', () => {
    test('should call next() when all fields are valid', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should call next() with minimal valid data', () => {
      req.body = {
        nama: 'A',
        email: 'a@b.c',
        telepon: '1234567890',
        alamat: 'Test',
        password: '123456',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should call next() with password exactly 6 characters', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: '123456',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error cases - missing required fields', () => {
    test('should return error when nama is missing', () => {
      req.body = {
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when email is missing', () => {
      req.body = {
        nama: 'John Doe',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when telepon is missing', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when alamat is missing', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when password is missing', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when all fields are missing', () => {
      req.body = {};

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when field is empty string', () => {
      req.body = {
        nama: '',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when field is null', () => {
      req.body = {
        nama: null,
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    test('should return error when field is undefined', () => {
      req.body = {
        nama: undefined,
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });
  });

  describe('Error cases - password validation', () => {
    test('should return error when password is less than 6 characters', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: '12345',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password minimal 6 karakter' });
    });

    test('should return error when password is 5 characters', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: '12345',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password minimal 6 karakter' });
    });

    test('should return error when password is 1 character', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: '1',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password minimal 6 karakter' });
    });

    test('should return error when password is empty string', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: '',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      // This should fail on the "all fields required" check first
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });
  });

  describe('Error cases - email validation', () => {
    test('should return error when email format is invalid (no @)', () => {
      req.body = {
        nama: 'John Doe',
        email: 'invalidemail',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email format tidak valid' });
    });

    test('should return error when email format is invalid (no domain)', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email format tidak valid' });
    });

    test('should return error when email format is invalid (no TLD)', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email format tidak valid' });
    });

    test('should return error when email contains spaces', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john @example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email format tidak valid' });
    });

    test('should accept valid email with subdomain', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@mail.example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should accept valid email with numbers', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john123@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should accept valid email with special characters in local part', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john.doe+test@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long password', () => {
      req.body = {
        nama: 'John Doe',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'a'.repeat(100),
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should handle special characters in nama', () => {
      req.body = {
        nama: 'John Doe ÄÖÜ',
        email: 'john@example.com',
        telepon: '1234567890',
        alamat: 'Jl. Test No. 1',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});

describe('validateLogin', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Normal cases', () => {
    test('should call next() when email and password are valid', () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should call next() with minimal valid data', () => {
      req.body = {
        email: 'a@b.c',
        password: '1',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error cases - missing fields', () => {
    test('should return error when email is missing', () => {
      req.body = {
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when password is missing', () => {
      req.body = {
        email: 'john@example.com',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when both email and password are missing', () => {
      req.body = {};

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when email is empty string', () => {
      req.body = {
        email: '',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when password is empty string', () => {
      req.body = {
        email: 'john@example.com',
        password: '',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when email is null', () => {
      req.body = {
        email: null,
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when password is null', () => {
      req.body = {
        email: 'john@example.com',
        password: null,
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when email is undefined', () => {
      req.body = {
        email: undefined,
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    test('should return error when password is undefined', () => {
      req.body = {
        email: 'john@example.com',
        password: undefined,
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });
  });

  describe('Edge cases - email format', () => {
    test('should accept invalid email format (implementation does not validate email format)', () => {
      // Based on the actual implementation, validateLogin only checks if email and password exist
      // It does NOT validate email format like validateRegister does
      req.body = {
        email: 'invalidemail',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should accept email without @', () => {
      req.body = {
        email: 'invalidemail',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should accept email without domain', () => {
      req.body = {
        email: 'test@',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases - password format', () => {
    test('should accept very short password (implementation does not validate password length)', () => {
      // Based on the actual implementation, validateLogin only checks if password exists
      // It does NOT validate password length like validateRegister does
      req.body = {
        email: 'john@example.com',
        password: '1',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should accept empty string as password if not explicitly empty', () => {
      // This should fail because empty string is falsy
      req.body = {
        email: 'john@example.com',
        password: ' ',
      };

      validateLogin(req, res, next);

      // Space is truthy, so it should pass
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
