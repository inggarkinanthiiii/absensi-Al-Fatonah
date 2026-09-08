import { mosqueLocationRepository } from '../repositories/mosqueLocationRepository.js';

const MAIN_LOCATION_NAME = 'Masjid Al-Fatonah, Yogyakarta, Gamping, Sleman, Balecatur, Temuwuh Kidul, Perumahan PBA';

export const mosqueLocationService = {
  async getMainLocation() {
    return await mosqueLocationRepository.findMain();
  },

  async saveMainLocation({ latitude, longitude }) {
    return await mosqueLocationRepository.saveMain({
      nama: MAIN_LOCATION_NAME,
      latitude,
      longitude,
    });
  },
};
