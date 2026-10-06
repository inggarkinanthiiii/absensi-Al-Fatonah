import { calculateDistance } from '../../utils/distanceCalculator.js';

// Menguji perhitungan jarak antara dua pasang koordinat geografis.
describe('calculateDistance', () => {
  // Menguji perhitungan jarak untuk koordinat yang umum digunakan.
  describe('Kasus normal', () => {
    // Menguji bahwa dua koordinat identik memiliki jarak nol.
    test('menghasilkan jarak 0 untuk koordinat yang identik', () => {
      const lat = -6.2088;
      const lon = 106.8456;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    // Menguji bahwa dua koordinat berbeda menghasilkan jarak positif.
    test('menghasilkan jarak lebih dari 0 untuk koordinat yang berbeda', () => {
      // Monas to Bundaran HI (approximately 1.5 km)
      const lat1 = -6.1754;
      const lon1 = 106.8272;
      const lat2 = -6.1944;
      const lon2 = 106.8229;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(3000); // Should be around 2.2 km
    });

    // Menguji kewajaran hasil jarak untuk dua lokasi yang diketahui.
    test('menghitung jarak yang wajar untuk lokasi yang diketahui', () => {
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

    // Menguji ketepatan perhitungan untuk jarak yang relatif pendek.
    test('menghitung jarak pendek dengan akurat', () => {
      // Two points 100 meters apart
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.2097; // ~100m north
      const lon2 = 106.8456;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    // Menguji perhitungan untuk jarak yang sangat jauh.
    test('menghitung jarak yang jauh', () => {
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

  // Menguji koordinat pada batas geografis utama.
  describe('Kasus khusus - batas koordinat', () => {
    // Menguji perhitungan jarak pada garis khatulistiwa.
    test('menghitung jarak pada koordinat di khatulistiwa', () => {
      const lat1 = 0;
      const lon1 = 0;
      const lat2 = 0;
      const lon2 = 1; // 1 degree longitude at equator ≈ 111 km
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    // Menguji perhitungan jarak di sekitar kutub.
    test('menghitung jarak pada koordinat di kutub', () => {
      const lat1 = 90;
      const lon1 = 0;
      const lat2 = 89;
      const lon2 = 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    // Menguji perhitungan jarak yang melintasi garis tanggal internasional.
    test('menghitung jarak pada koordinat di garis tanggal internasional', () => {
      const lat1 = 0;
      const lon1 = 179;
      const lat2 = 0;
      const lon2 = -179;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(220000);
      expect(distance).toBeLessThan(224000);
    });

    // Menguji perhitungan dengan garis lintang di belahan bumi selatan.
    test('menghitung jarak untuk lintang negatif di belahan bumi selatan', () => {
      const lat1 = -10;
      const lon1 = 100;
      const lat2 = -20;
      const lon2 = 100;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(1100000);
      expect(distance).toBeLessThan(1120000);
    });

    // Menguji perhitungan dengan garis bujur di belahan bumi barat.
    test('menghitung jarak untuk bujur negatif di belahan bumi barat', () => {
      const lat1 = 0;
      const lon1 = -10;
      const lat2 = 0;
      const lon2 = -20;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(1100000);
      expect(distance).toBeLessThan(1120000);
    });
  });

  // Menguji masukan di luar rentang koordinat tanpa mengharapkan validasi.
  describe('Kasus khusus - koordinat tidak valid (implementasi tidak melakukan validasi)', () => {
    // Menguji bahwa koordinat dengan lintang di atas 90 tetap menghasilkan angka.
    test('memproses koordinat dengan lintang di atas rentang valid (lat > 90)', () => {
      // Implementation does not validate, so it will calculate anyway
      const lat1 = 100;
      const lon1 = 0;
      const lat2 = 90;
      const lon2 = 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      // Function will return a value, though not geographically meaningful
      expect(typeof distance).toBe('number');
    });

    // Menguji bahwa koordinat dengan bujur di atas 180 tetap menghasilkan angka.
    test('memproses koordinat dengan bujur di atas rentang valid (lon > 180)', () => {
      const lat1 = 0;
      const lon1 = 200;
      const lat2 = 0;
      const lon2 = 180;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(typeof distance).toBe('number');
    });

    // Menguji perhitungan untuk koordinat nol.
    test('menghitung jarak untuk koordinat nol', () => {
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    // Menguji perhitungan ketika selisih koordinat sangat kecil.
    test('menghitung jarak untuk perbedaan koordinat yang sangat kecil', () => {
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.2088001;
      const lon2 = 106.8456001;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThanOrEqual(0);
      expect(distance).toBeLessThan(1); // Very small distance
    });
  });

  // Menguji arah perubahan koordinat dan perpindahan diagonal.
  describe('Kasus khusus', () => {
    // Menguji jarak dengan garis lintang sama dan garis bujur berbeda.
    test('menghitung jarak dengan lintang sama dan bujur berbeda', () => {
      const lat = -6.2088;
      const lon1 = 106.8456;
      const lon2 = 107.8456; // 1 degree difference
      
      const distance = calculateDistance(lat, lon1, lat, lon2);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    // Menguji jarak dengan garis bujur sama dan garis lintang berbeda.
    test('menghitung jarak dengan bujur sama dan lintang berbeda', () => {
      const lon = 106.8456;
      const lat1 = -6.2088;
      const lat2 = -5.2088; // 1 degree difference
      
      const distance = calculateDistance(lat1, lon, lat2, lon);
      expect(distance).toBeGreaterThan(110000);
      expect(distance).toBeLessThan(112000);
    });

    // Menguji perhitungan saat garis lintang dan bujur berubah bersamaan.
    test('menghitung perpindahan diagonal saat lintang dan bujur berubah', () => {
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.1088;
      const lon2 = 106.9456;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
    });
  });
});
