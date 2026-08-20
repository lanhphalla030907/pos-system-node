const { db, isArray, isEmpty } = require("../util/helper");
exports.getCategory = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { Name, Description, Status, ParentID } = req.body;
    if (!Name || !Name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    var sql =
      "INSERT INTO category(Name,Description,Status,ParentId) VALUES (:Name,:Description,:Status,:ParentID) ";
    var [data] = await db.query(sql, {
      Name: Name.trim(),
      Description: Description || null,
      Status: Status != null ? Status : 1,
      ParentID: ParentID || null,
    });
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { id: data.insertId },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const { Id, Name, Description, Status, ParentID } = req.body;
    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }
    if (!Name || !Name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    var sql =
      "UPDATE category SET Name=:Name, Description=:Description, Status=:Status, ParentID=:ParentID WHERE Id=:Id ";
    var [data] = await db.query(sql, {
      Id,
      Name: Name.trim(),
      Description: Description || null,
      Status: Status != null ? Status : 1,
      ParentID: ParentID || null,
    });
    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }
    var sql = "DELETE FROM category WHERE Id=:Id";
    var [data] = await db.query(sql, {
      Id: id,
    });
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
