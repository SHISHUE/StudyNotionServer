const Category = require("../models/Category");

//create Category ka handler fnc
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields require.",
      });
    }

    const CategoryCreation = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategoryCreation);

    return res.status(200).json({
      success: true,
      message: "Category created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went rigth while createing a Category.",
    });
  }
};

//getAll Categorys handler
exports.showAllCategorys = async (req, res) => {
  try {
    const allCategorys = await Category.find({}, { name: true, description: true });
    console.log(allCategorys);

    return res.status(200).json({
      success: true,
      message: "Category get successfully.",
      allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went rigth while getting all Category.",
    });
  }
};

//categoryPageDetails
exports.categoryPageDetails = async(req, res) => {
  try {
    //get category id
    const {categoryId} = req.body;
    // get courses for specified category id
    const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
    //validation
    if(!selectedCategory) {
      return res.status(404).json({
        success: false,
        message:"Data not found"
      });
    }
    //get course for defferent category
    const diffrentCategories = await Category.find({
      _id: {$ne: categoryId},
    }).populate("courses").exec();
    // get top 10 selling courses

    // return response
    return res.status(200).json({
      success: true,
      message:"All category",
      data: {
        selectedCategory,
        diffrentCategories
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"not find category based courses. "
    })
  }
}