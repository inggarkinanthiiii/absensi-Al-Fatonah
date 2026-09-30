import { calculateDistance } from '../../utils/distanceCalculator.js';

describe('calculateDistance', () => {
  describe('Normal cases', () => {
    test('should return 0 for identical coordinates', () => {
      const lat = -6.2088;
      const lon = 106.8456;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    test('should return distance > 0 for different coordinates', () => {
      // Monas to Bundaran HI (approximately 1.5 km)
      const lat1 = -6.1754;
      const lon1 = 106.8272;
      const lat2 = -6.1944;
      const lon2 = 106.8229;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(3000); // Should be around 2.2 km
    });

    test('should calculate reasonable distance for known locations', () => {
      // Jakarta to Bandung (approximately 150 km)
      const jakartaLat = -6.2088;
      const jakartaLon = 106.8456;
      const bandungLat = -6.9175;
      const bandungLon = 107.6191;
      
      const distance = calculateDistance(jakartaLat, jakartaLon, bandungLat, bandungLon);
      // The actual distance might be different from our estimate
      // Let's check it's a reasonable distance (between 100-200 km)
      expect(distance).toBeGreaterThan(100000); // > 100 km
      expect(distance).toBeLessThan(200000); // < 200 km
    });

    test('should handle short distances accurately', () => {
      // Two points 100 meters apart
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.2097; // ~100m north
      const lon2 = 106.8456;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    test('should handle long distances', () => {
      // Jakarta to New York (approximately 16,000 km)
      const jakartaLat = -6.2088;
      const jakartaLon = 106.8456;
      const nyLat = 40.7128;
      const nyLon = -74.0060;
      
      const distance = calculateDistance(jakartaLat, jakartaLon, nyLat, nyLon);
      expect(distance).toBeGreaterThan(15000000); // > 15,000 km
      expect(distance).toBeLessThan(17000000); // < 17,000 km
    });
  });

  describe('Edge cases - coordinate boundaries', () => {
    test('should handle coordinates at equator', () => {
      const lat1 = 0;
      const lon1 = 0;
      const lat2 = 0;
      const lon2 = 1; // 1 degree longitude at equator ≈ 111 km
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    test('should handle coordinates at poles', () => {
      const lat1 = 90;
      const lon1 = 0;
      const lat2 = 89;
      const lon2 = 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    test('should handle coordinates at antimeridian', () => {
      const lat1 = 0;
      const lon1 = 179;
      const lat2 = 0;
      const lon2 = -179;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(220000);
      expect(distance).toBeLessThan(224000);
    });

    test('should handle negative latitudes (southern hemisphere)', () => {
      const lat1 = -10;
      const lon1 = 100;
      const lat2 = -20;
      const lon2 = 100;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(1100000);
      expect(distance).toBeLessThan(1120000);
    });

    test('should handle negative longitudes (western hemisphere)', () => {
      const lat1 = 0;
      const lon1 = -10;
      const lat2 = 0;
      const lon2 = -20;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(1100000);
      expect(distance).toBeLessThan(1120000);
    });
  });

  describe('Edge cases - invalid coordinates (no validation in implementation)', () => {
    test('should handle coordinates beyond valid range (lat > 90)', () => {
      // Implementation does not validate, so it will calculate anyway
      const lat1 = 100;
      const lon1 = 0;
      const lat2 = 90;
      const lon2 = 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      // Function will return a value, though not geographically meaningful
      expect(typeof distance).toBe('number');
    });

    test('should handle coordinates beyond valid range (lon > 180)', () => {
      const lat1 = 0;
      const lon1 = 200;
      const lat2 = 0;
      const lon2 = 180;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(typeof distance).toBe('number');
    });

    test('should handle zero coordinates', () => {
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    test('should handle very small coordinate differences', () => {
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.2088001;
      const lon2 = 106.8456001;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThan(1); // Very small distance
    });
  });

  describe('Special cases', () => {
    test('should handle same latitude, different longitude', () => {
      const lat = -6.2088;
      const lon1 = 106.8456;
      const lon2 = 107.8456; // 1 degree difference
      
      const distance = calculateDistance(lat, lon1, lat, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    test('should handle same longitude, different latitude', () => {
      const lon = 106.8456;
      const lat1 = -6.2088;
      const lat2 = -5.2088; // 1 degree difference
      
      const distance = calculateDistance(lat1, lon, lat2, lon);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    test('should handle diagonal movement (both lat and lon change)', () => {
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.1088;
      const lon2 = 106.9456;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
    });
  });
});
