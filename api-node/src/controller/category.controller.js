const { db, isArray, isEmpty } = require("../util/helper");
exports.getCategory = async (req, res) => {
  const { status } = req.query;
  let sql = `
        SELECT Id, Name, Status,CreateAt,Description
        FROM category
    `;
  const params = [];
  if (status !== undefined) {
    sql += `
            WHERE Status = ?
        `;
    params.push(status);
  }
  sql += `
        ORDER BY Id DESC
    `;
  const [list] = await db.query(sql, params);
  res.json({
    success: true,
    data: list,
  });
};

exports.createCategory = async (req, res) => {
  var sql =
    "INSERT INTO category(Name,Description,Status,ParentId) VALUES (:Name,:Description,:Status,:ParentID) ";
  var [data] = await db.query(sql, {
    Name: req.body.Name,
    Description: req.body.Description,
    Status: req.body.Status,
    ParentID: req.body.ParentID,
  });
  res.json({
    data: data,
  });
};
exports.updateCategory = async (req, res) => {
  var sql =
    "UPDATE category SET Name=:Name, Description=:Description, Status=:Status, ParentID=:ParentID WHERE Id=:Id ";
  var [data] = await db.query(sql, {
    Id: req.body.Id,
    Name: req.body.Name,
    Description: req.body.Description,
    Status: req.body.Status,
    ParentID: req.body.ParentID,
  });
  res.json({
    data: data,
    message: "Update jork jum",
  });
};
exports.deleteCategory = async (req, res) => {
  var sql = "DELETE FROM category WHERE Id=:Id";
  var [data] = await db.query(sql, {
    Id: req.body.id,
  });
  res.json({
    data: data,
    message: "delete bn jork jum",
  });
};
