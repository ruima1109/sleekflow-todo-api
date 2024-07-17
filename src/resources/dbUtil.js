// programatically construct the update expression.
const composeUpdateRequest = (
  primaryKey,
  sortKey,
  item,
  tableName,
  primaryKeyName,
  sortKeyName
) => {
  let updateExpression = 'set';
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(item).forEach((property) => {
    updateExpression += ` #${property} = :${property},`;
    expressionAttributeNames[`#${property}`] = property;
    expressionAttributeValues[`:${property}`] = item[property];
  });

  updateExpression = updateExpression.slice(0, -1);

  const key = {
    [primaryKeyName]: primaryKey
  };
  
  if (sortKey && sortKeyName) {
    key[sortKeyName] = sortKey;
  }

  // Construct the ConditionExpression to check that the item exists
  const conditionExpression = `attribute_exists(${primaryKeyName})` + (sortKeyName ? ` AND attribute_exists(${sortKeyName})` : '');

  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: conditionExpression
  };

  return params;
};

module.exports = {
  composeUpdateRequest
};
