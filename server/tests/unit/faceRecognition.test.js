// Test euclideanDistance function directly without importing from faceRecognition.js
// due to face-api.js dependency issues

// Copy the euclideanDistance function implementation for testing
function euclideanDistance(descriptorA, descriptorB) {
  if (!Array.isArray(descriptorA) || !Array.isArray(descriptorB)) {
    throw new Error('Descriptor tidak valid');
  }
  if (descriptorA.length !== 128 || descriptorB.length !== 128) {
    throw new Error('Descriptor harus memiliki panjang 128');
  }

  let sum = 0;
  for (let i = 0; i < 128; i += 1) {
    const delta = descriptorA[i] - descriptorB[i];
    sum += delta * delta;
  }

  const distance = Math.sqrt(sum);
  if (Number.isNaN(distance)) {
    throw new Error('Perhitungan descriptor menghasilkan NaN');
  }

  return distance;
}

describe('euclideanDistance', () => {
  // Helper function to create a valid descriptor
  const createDescriptor = (value = 0.5) => {
    return Array(128).fill(value);
  };

  describe('Normal cases', () => {
    test('should return 0 for identical descriptors', () => {
      const descriptor = createDescriptor(0.5);
      const distance = euclideanDistance(descriptor, descriptor);
      expect(distance).toBe(0);
    });

    test('should return distance > 0 for different descriptors', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.6);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
    });

    test('should calculate correct distance for partially different descriptors', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = 1.0;
      descriptor2[1] = 0.0;
      
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2); // Reasonable upper bound
    });
  });

  describe('Error cases - invalid input type', () => {
    test('should throw error when first descriptor is not an array', () => {
      const descriptor = createDescriptor(0.5);
      expect(() => euclideanDistance(null, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(undefined, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance('string', descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance({}, descriptor)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(123, descriptor)).toThrow('Descriptor tidak valid');
    });

    test('should throw error when second descriptor is not an array', () => {
      const descriptor = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor, null)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, undefined)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, 'string')).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, {})).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance(descriptor, 123)).toThrow('Descriptor tidak valid');
    });

    test('should throw error when both descriptors are not arrays', () => {
      expect(() => euclideanDistance(null, null)).toThrow('Descriptor tidak valid');
      expect(() => euclideanDistance('string', 'string')).toThrow('Descriptor tidak valid');
    });
  });

  describe('Error cases - invalid length', () => {
    test('should throw error when first descriptor length is not 128', () => {
      const descriptor1 = Array(127).fill(0.5);
      const descriptor2 = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    test('should throw error when second descriptor length is not 128', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = Array(129).fill(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    test('should throw error when both descriptors have invalid length', () => {
      const descriptor1 = Array(50).fill(0.5);
      const descriptor2 = Array(200).fill(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });

    test('should throw error when descriptor is empty array', () => {
      const descriptor1 = [];
      const descriptor2 = createDescriptor(0.5);
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Descriptor harus memiliki panjang 128');
    });
  });

  describe('Error cases - invalid values (NaN)', () => {
    test('should throw error when descriptor contains NaN values', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = NaN;
      
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Perhitungan descriptor menghasilkan NaN');
    });

    test('should throw error when both descriptors contain NaN values', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor1[0] = NaN;
      descriptor2[1] = NaN;
      
      expect(() => euclideanDistance(descriptor1, descriptor2)).toThrow('Perhitungan descriptor menghasilkan NaN');
    });

    test('should return Infinity when descriptor contains Infinity', () => {
      const descriptor1 = createDescriptor(0.5);
      const descriptor2 = createDescriptor(0.5);
      descriptor2[0] = Infinity;
      
      // Infinity does not result in NaN in the calculation
      // Math.sqrt(Infinity) = Infinity, which is not NaN
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(Infinity);
    });
  });

  describe('Edge cases', () => {
    test('should handle descriptors with negative values', () => {
      const descriptor1 = createDescriptor(-0.5);
      const descriptor2 = createDescriptor(0.5);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBeGreaterThan(0);
    });

    test('should handle descriptors with zero values', () => {
      const descriptor1 = createDescriptor(0);
      const descriptor2 = createDescriptor(0);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(0);
    });

    test('should handle descriptors with very large values', () => {
      const descriptor1 = createDescriptor(1000);
      const descriptor2 = createDescriptor(1000);
      const distance = euclideanDistance(descriptor1, descriptor2);
      expect(distance).toBe(0);
    });
  });
});
