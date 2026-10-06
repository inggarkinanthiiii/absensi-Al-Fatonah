import { jest } from '@jest/globals';
import { validateRegister, validateLogin } from '../../middlewares/validationMiddleware.js';

// Menguji aturan validasi untuk proses registrasi.
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

  // Menguji registrasi dengan data yang memenuhi aturan validasi.
  describe('Kasus normal', () => {
    // Menguji bahwa proses diteruskan ketika seluruh data wajib valid.
    test('meneruskan proses ketika seluruh data wajib valid', () => {
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

    // Menguji bahwa data registrasi minimal yang valid dapat diteruskan.
    test('meneruskan proses dengan data minimal yang valid', () => {
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

    // Menguji bahwa password dengan panjang tepat enam karakter diterima.
    test('menerima password dengan panjang tepat 6 karakter', () => {
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

  // Menguji penolakan ketika data registrasi wajib tidak tersedia atau kosong.
  describe('Kasus error - data wajib tidak diisi', () => {
    // Menguji penolakan registrasi ketika nama tidak diisi.
    test('menolak registrasi ketika nama tidak diisi', () => {
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

    // Menguji penolakan registrasi ketika email tidak diisi.
    test('menolak registrasi ketika email tidak diisi', () => {
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

    // Menguji penolakan registrasi ketika nomor telepon tidak diisi.
    test('menolak registrasi ketika telepon tidak diisi', () => {
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

    // Menguji penolakan registrasi ketika alamat tidak diisi.
    test('menolak registrasi ketika alamat tidak diisi', () => {
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

    // Menguji penolakan registrasi ketika password tidak diisi.
    test('menolak registrasi ketika password tidak diisi', () => {
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

    // Menguji penolakan registrasi ketika semua data tidak diisi.
    test('menolak registrasi ketika seluruh data tidak diisi', () => {
      req.body = {};

      validateRegister(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
    });

    // Menguji penolakan registrasi ketika salah satu data berupa string kosong.
    test('menolak registrasi ketika salah satu data berupa string kosong', () => {
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

    // Menguji penolakan registrasi ketika salah satu data bernilai null.
    test('menolak registrasi ketika salah satu data bernilai null', () => {
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

    // Menguji penolakan registrasi ketika salah satu data bernilai undefined.
    test('menolak registrasi ketika salah satu data bernilai undefined', () => {
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

  // Menguji batas panjang password yang diterima saat registrasi.
  describe('Kasus error - validasi password', () => {
    // Menguji penolakan password yang panjangnya kurang dari enam karakter.
    test('menolak password yang panjangnya kurang dari 6 karakter', () => {
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

    // Menguji penolakan password yang panjangnya lima karakter.
    test('menolak password yang panjangnya 5 karakter', () => {
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

    // Menguji penolakan password yang hanya terdiri dari satu karakter.
    test('menolak password yang hanya terdiri dari 1 karakter', () => {
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

    // Menguji bahwa password kosong ditolak sebagai data wajib yang tidak diisi.
    test('menolak password berupa string kosong', () => {
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

  // Menguji format email yang ditolak dan variasi format yang diterima.
  describe('Kasus error - validasi email', () => {
    // Menguji penolakan email yang tidak memiliki tanda @.
    test('menolak email tanpa tanda @', () => {
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

    // Menguji penolakan email yang tidak memiliki nama domain setelah tanda @.
    test('menolak email tanpa domain', () => {
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

    // Menguji penolakan email yang tidak memiliki ekstensi domain.
    test('menolak email tanpa TLD', () => {
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

    // Menguji penolakan email yang mengandung spasi.
    test('menolak email yang mengandung spasi', () => {
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

    // Menguji penerimaan email dengan subdomain yang valid.
    test('menerima email valid dengan subdomain', () => {
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

    // Menguji penerimaan email yang memuat angka.
    test('menerima email valid yang mengandung angka', () => {
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

    // Menguji penerimaan email dengan karakter khusus pada bagian nama.
    test('menerima email valid dengan karakter khusus pada bagian nama', () => {
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

  // Menguji data registrasi valid dengan nilai yang tidak umum.
  describe('Kasus khusus', () => {
    // Menguji bahwa password yang sangat panjang tetap dapat diterima.
    test('menerima password yang sangat panjang', () => {
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

    // Menguji bahwa nama dengan karakter khusus tetap dapat diterima.
    test('menerima nama yang mengandung karakter khusus', () => {
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

// Menguji aturan validasi untuk proses login.
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

  // Menguji proses login dengan email dan password yang tersedia.
  describe('Kasus normal', () => {
    // Menguji bahwa login diteruskan ketika email dan password diisi.
    test('meneruskan proses ketika email dan password terisi', () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    // Menguji bahwa data login minimal dapat diteruskan.
    test('meneruskan proses dengan data minimal yang valid', () => {
      req.body = {
        email: 'a@b.c',
        password: '1',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // Menguji penolakan login ketika email atau password tidak tersedia.
  describe('Kasus error - data wajib tidak diisi', () => {
    // Menguji penolakan login ketika email tidak diisi.
    test('menolak login ketika email tidak diisi', () => {
      req.body = {
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika password tidak diisi.
    test('menolak login ketika password tidak diisi', () => {
      req.body = {
        email: 'john@example.com',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika email dan password tidak diisi.
    test('menolak login ketika email dan password tidak diisi', () => {
      req.body = {};

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika email berupa string kosong.
    test('menolak login ketika email berupa string kosong', () => {
      req.body = {
        email: '',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika password berupa string kosong.
    test('menolak login ketika password berupa string kosong', () => {
      req.body = {
        email: 'john@example.com',
        password: '',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika email bernilai null.
    test('menolak login ketika email bernilai null', () => {
      req.body = {
        email: null,
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika password bernilai null.
    test('menolak login ketika password bernilai null', () => {
      req.body = {
        email: 'john@example.com',
        password: null,
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika email bernilai undefined.
    test('menolak login ketika email bernilai undefined', () => {
      req.body = {
        email: undefined,
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email dan password wajib diisi' });
    });

    // Menguji penolakan login ketika password bernilai undefined.
    test('menolak login ketika password bernilai undefined', () => {
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

  // Menguji bahwa format email tidak diperiksa oleh validasi login.
  describe('Kasus khusus - format email', () => {
    // Menguji penerimaan email dengan format tidak valid selama nilainya tersedia.
    test('menerima email dengan format tidak valid karena format tidak diperiksa saat login', () => {
      // Based on the actual implementation, validateLogin only checks if email and password exist
      // It does NOT validate email format like validateRegister does
      req.body = {
        email: 'invalidemail',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    // Menguji penerimaan email yang tidak memiliki tanda @.
    test('menerima email tanpa tanda @', () => {
      req.body = {
        email: 'invalidemail',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    // Menguji penerimaan email yang tidak memiliki nama domain.
    test('menerima email tanpa domain', () => {
      req.body = {
        email: 'test@',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // Menguji bahwa validasi login hanya mensyaratkan password tersedia.
  describe('Kasus khusus - format password', () => {
    // Menguji penerimaan password pendek karena panjangnya tidak divalidasi saat login.
    test('menerima password sangat pendek karena panjangnya tidak diperiksa saat login', () => {
      // Based on the actual implementation, validateLogin only checks if password exists
      // It does NOT validate password length like validateRegister does
      req.body = {
        email: 'john@example.com',
        password: '1',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    // Menguji bahwa password berisi spasi tetap dianggap tersedia.
    test('menerima password yang berisi spasi karena nilainya tidak kosong', () => {
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
