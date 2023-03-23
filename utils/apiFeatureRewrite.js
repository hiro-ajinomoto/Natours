class APIFeature {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };

    //eliminate parameters except string you should query
    const excludedFields = ['sort', 'page', 'limit', 'fields'];

    excludedFields.forEach((ele) => delete queryObj(ele));

    let queryString = JSON.stringify(queryObj); // turn into json object

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    //turn it back to javascript object
    queryString = JSON.parse(queryString);

    this.query = this.query(queryString); // reassign the query -> because it will be called again
    return this;
  }

  sort() {
    // this happens as all the result has been already returned and 'sort' is required in url from clients

    if (this.queryString.sort) {
      const querySortBy = this.queryString.split(',').join(' ');

      this.query = this.query.sort(querySortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const limit = this.query.limit * 1 || 100; // default is 100

    const page = this.query.limit * 1 || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
