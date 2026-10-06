import { euclideanDistance } from '../../utils/faceRecognition.js';

// Menguji fungsi perhitungan jarak antara dua face descriptor.
describe('euclideanDistance', () => {
  // Helper function to create a valid descriptor
  const createDescriptor = (value = 0.5) => {
    return Array(128).fill(value);
  };

  // Menguji hasil perhitungan pada descriptor yang valid.
  describe('Kasus normal', () => {
    // Menguji bahwa dua descriptor identik memiliki jarak nol.
    test('menghasilkan jarak 0 untuk descriptor yang identik', () => {
      const descriptor = createDescriptor(0.5);
      const distance = euclideanDistance(descriptor, descriptor);
      expect(distance).toBe(0);
    });

    // Menguji bahwa perbedaan nilai descriptor menghasilkan jarak positif.
    test('menghasilkan jarak lebih dari 0 untuk descriptor yang berbeda', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.6);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
    });

    // Menguji perhitungan saat hanya sebagian nilai descriptor yang berbeda.
    test('menghitung jarak dengan benar saat sebagian nilai descriptor berbeda', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = 1.0;
      descriptor2[1] = 0.0;

      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2); // Reasonable upper bound
    });
  });

  // Menguji penolakan input descriptor yang bukan berupa array.
  describe('Kasus error - tipe input tidak valid', () => {
    // Menguji penolakan ketika descriptor pertama bukan array.
    test('menolak descriptor pertama yang bukan array', () => {
      const descriptor = createDescriptor(0.5);
      expect(() => euclideanDistance(null, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(undefined, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance('string', descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance({}, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(123, descriptor)).toThrow('Descriptor tidak valid');
    });

    // Menguji penolakan ketika descriptor kedua bukan array.
    test('menolak descriptor kedua yang bukan array', () => {
      const descriptor = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor, null)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, undefined)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, 'string')).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, {})).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, 123)).toThrow('Descriptor tidak valid');
    });

    // Menguji penolakan ketika kedua descriptor bukan array.
    test('menolak kedua descriptor yang bukan array', () => {
      expect(() => euclideanDistance(null, null)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance('string', 'string')).toThrow('Descriptor tidak valid');
    });
  });

  // Menguji penolakan descriptor yang panjangnya tidak sesuai ketentuan.
  describe('Kasus error - panjang tidak valid', () => {
    // Menguji penolakan ketika panjang descriptor pertama bukan 128.
    test('menolak descriptor pertama yang panjangnya bukan 128', () => {
      const descriptor1 = Array(127).fill(0.5);
      const descriptor2 = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    // Menguji penolakan ketika panjang descriptor kedua bukan 128.
    test('menolak descriptor kedua yang panjangnya bukan 128', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = Array(129).fill(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    // Menguji penolakan ketika kedua descriptor memiliki panjang tidak valid.
    test('menolak kedua descriptor yang panjangnya tidak valid', () => {
      const descriptor1 = Array(50).fill(0.5);
      const descriptor2 = Array(200).fill(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    // Menguji penolakan terhadap descriptor kosong.
    test('menolak descriptor berupa array kosong', () => {
      const descriptor1 = [];
      const descriptor2 = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });
  });

  // Menguji perilaku perhitungan terhadap nilai NaN dan Infinity.
  describe('Kasus error - nilai tidak valid (NaN)', () => {
    // Menguji bahwa nilai NaN pada descriptor menghasilkan error.
    test('menolak descriptor yang berisi nilai NaN', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = NaN;

      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Perhitungan descriptor menghasilkan NaN');
    });

    // Menguji bahwa nilai NaN pada kedua descriptor menghasilkan error.
    test('menolak kedua descriptor yang berisi nilai NaN', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor1[0] = NaN;
      descriptor2[1] = NaN;

      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Perhitungan descriptor menghasilkan NaN');
    });

    // Menguji bahwa nilai Infinity menghasilkan jarak Infinity, bukan error NaN.
    test('menghasilkan Infinity ketika descriptor berisi Infinity', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = Infinity;

      // Infinity does not result in NaN in the calculation
      // Math.sqrt(Infinity) = Infinity, which is not NaN
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(Infinity);
    });
  });

  // Menguji nilai batas yang masih dapat diproses oleh fungsi.
  describe('Kasus khusus', () => {
    // Menguji perhitungan jarak dengan nilai descriptor negatif.
    test('menghitung jarak untuk descriptor dengan nilai negatif', () => {
      const descriptor1 = createDescriptor(-0.5);
      const descriptor2 = createDescriptor(0.5);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
    });

    // Menguji perhitungan jarak ketika seluruh nilai descriptor adalah nol.
    test('menghitung jarak untuk descriptor dengan nilai nol', () => {
      const descriptor1 = createDescriptor(0);
      const descriptor2 = createDescriptor(0);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(0);
    });

    // Menguji perhitungan jarak dengan nilai descriptor yang sangat besar.
    test('menghitung jarak untuk descriptor dengan nilai sangat besar', () => {
      const descriptor1 = createDescriptor(1000);
      const descriptor2 = createDescriptor(1000);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(0);
    });
  });
});
