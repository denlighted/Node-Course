
class APIFEATURES{

  constructor(query, queryString){
    this.query = query;
    this.queryString = queryString;
  }


  filter(){
    const queryObj = {...this.queryString};

    const excludeFields = ['page', 'sort','limit','fields'];

    excludeFields.forEach(el=>{delete queryObj[el]});

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);

    this.query =  this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting(){
    if(this.queryString.sort){
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    }
    else{
      this.query =  this.query.sort('-createdAt');
    }

    return this;
  }

  limiting(){
    if(this.queryString.fields){
      const fieldsBy = this.queryString.fields.split(',').join(' ');
      console.log(fieldsBy);
      this.query = this.query.select(fieldsBy);
    }
    else{
      this.query =  this.query.select('-__v')
    }

    return this;
  }

  pagination(){
    const page = this.queryString.page*1 || 1;
    const limit = this.queryString.limit *1 || 100;
    const skippedValue = (page -1)*limit

    this.query = this.query.skip(skippedValue).limit(limit);
    return this;
  }
}

module.exports = APIFEATURES