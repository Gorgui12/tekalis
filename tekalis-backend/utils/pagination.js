// ===============================================
// 19. utils/pagination.js
// ===============================================

class PaginationHelper {
  constructor(model) {
    this.model = model;
  }
  
  async paginate(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = null,
      select = null
    } = options;
    
    const skip = (page - 1) * limit;
    
    let queryBuilder = this.model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }
    
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }
    
    const [results, total] = await Promise.all([
      queryBuilder.exec(),
      this.model.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
  
  async aggregate(pipeline, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const countPipeline = [...pipeline, { $count: "total" }];
    const resultPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];
    
    const [countResult, results] = await Promise.all([
      this.model.aggregate(countPipeline),
      this.model.aggregate(resultPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = PaginationHelper;