class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ['sort', 'limit', 'fields', 'page'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 1B) Advance Filtering
    let queryString = JSON.stringify(queryObj); // converts to JSON
    // console.log(queryString);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );
    // console.log(JSON.parse(queryString));
    // { difficulty: 'easy', duration: { '$gte': 5 } }

    // const query = Tour.find(queryObj);
    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // const sortBy = req.query.sort.split(',').join(' ');
      const sortBy = this.queryString.sort.replace(',', ' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // descending order = -
    }
    // sort('price ratingsAverage')

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // exclude = -
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
