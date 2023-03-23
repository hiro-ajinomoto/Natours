const filterObject = (obj, ...allowedFields) => {
  const newObject = {};

  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObject[ele] = obj[ele];
    }
  });

  return newObject;
};

module.exports = filterObject;
