import MosqueLocation from '../models/MosqueLocation.js';

export const mosqueLocationRepository = {
  async findMain() {
    return await MosqueLocation.findOne({ key: 'main' });
  },

  async saveMain(locationData) {
    return await MosqueLocation.findOneAndUpdate(
      { key: 'main' },
      { ...locationData, key: 'main' },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  },
};
