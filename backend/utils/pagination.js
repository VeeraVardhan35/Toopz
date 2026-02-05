/**
 * Returns `take` and `skip` values for pagination
 * @param {number} page - current page number (default 1)
 * @param {number} limit - number of items per page (default 20)
 * @returns {Object} { take, skip }
 */
export const paginate = (page = 1, limit = 20) => {
  const take = Math.max(parseInt(limit), 1); // items per page
  const skip = (Math.max(parseInt(page), 1) - 1) * take; // offset
  return { take, skip };
};

/**
 * Returns pagination metadata for the response
 * @param {number} total - total number of items
 * @param {number} page - current page number
 * @param {number} limit - number of items per page
 * @returns {Object} pagination meta
 */
export const getPaginationMeta = (total, page = 1, limit = 20) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,                 // total items
    page: Number(page),    // current page
    limit: Number(limit),  // items per page
    totalPages,            // total pages
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
