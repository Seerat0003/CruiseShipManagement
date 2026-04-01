export const categoryGroups = {
  catering: [
    'Starter',
    'Friday Special',
    'Dinner',
    'Desserts',
    'Chinese',
    'Japanese',
  ],
  stationery: [
    'Writing Tools',
    'Notes & Pads',
    'Measuring Tools',
    'Accessories',
  ],
};

export const getItemTypeFromCategory = (category = '') => {
  if (categoryGroups.catering.includes(category)) {
    return 'catering';
  }

  return 'stationery';
};
