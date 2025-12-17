const requireDatabase = require('./database.js');

/**
 * @param {*} data 所有数据库和集合
 * @returns
 */
function filterDatabasesAndCollections(data) {
  // 创建required的映射：数据库名 -> 所需集合名的Set
  const requiredMap = new Map();
  requireDatabase.forEach((db) => {
    const collectionNames = new Set(db.collections.map((col) => col.name));
    requiredMap.set(db.name, collectionNames);
  });

  // 筛选数据库并处理集合
  const filteredDatabases = data.databases
    .filter((db) => requiredMap.has(db.name)) // 只保留required中存在的数据库
    .map((db) => {
      const requiredCollections = requiredMap.get(db.name); // 根据存在数据库获取其存在集合（小于等于所有的集合）

      // 筛选集合：只保留required中指定的集合
      const filteredCollections = db.collections.filter((col) =>
        requiredCollections.has(col.name)
      );
      // 返回包含筛选后集合的数据库对象
      return {
        ...db,
        collections: filteredCollections,
      };
    });

  // 返回完整结果
  return {
    ...data,
    databases: filteredDatabases,
  };
}

/**
 * @param {Array} collections 数据库所有集合
 * @param {String} dbName 数据库名
 */
function filterCollections(collections, dbName) {
  // 创建required的映射：数据库名 -> 所需集合名的Set
  const requiredMap = new Map();
  requireDatabase.forEach((db) => {
    const collectionNames = new Set(db.collections.map((col) => col.name));
    requiredMap.set(db.name, collectionNames);
  });

  const requiredCollections = requiredMap.get(dbName);
  const filteredCollections = collections.filter((col) =>
    requiredCollections.has(col.name)
  );

  return filteredCollections;
}

module.exports = { filterDatabasesAndCollections, filterCollections };
