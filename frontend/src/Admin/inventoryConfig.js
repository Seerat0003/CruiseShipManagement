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
    'Safety Equipment',
    'Cabin Furniture',
    'Galley Gear',
    'Boutique Merchandise',
    'Recreation Gear',
    'Gifts',
    'Retail',
  ],
};

export const getItemTypeFromCategory = (category = '') => {
  const normalizedCategory = String(category).trim();

  if (categoryGroups.catering.includes(normalizedCategory)) {
    return 'catering';
  }

  return 'stationery';
};
