class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj); //--> turn in to JSON object`

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // replace `gte|gt|lte|lt` by [$gte te]

    // this.query = this.query.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // return the whole object
  }

  sort() {
    if (this.queryString.sort) {
      const querySortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(querySortBy);
    } else {
      // default sort by created at decline
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // lấy hết ngoại trừ thằng __v
    }

    return this;
  }

  paginate() {
    const limit = this.queryString.limit * 1 || 100;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
