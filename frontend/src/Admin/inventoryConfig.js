export const categoryGroups = {
  catering: [
    'Dining',
    'Catering',
    'Food',
    'Starter',
    'Friday Special',
    'Dinner',
    'Desserts',
    'Chinese',
    'Japanese',
  ],
  stationery: [
    'Gifts',
    'Stationery',
    'Retail',
    'Writing Tools',
    'Notes & Pads',
    'Measuring Tools',
    'Accessories',
  ],
};

export const getItemTypeFromCategory = (category = '') => {
  const normalizedCategory = String(category).trim();

  if (categoryGroups.catering.includes(normalizedCategory)) {
    return 'catering';
  }

  return 'stationery';
};
