const { Mongoose } = require("mongoose");
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
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


//categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const { categoryId } = req.body;

    

    // get courses for specified category id
    const selectedCategory = await Category.findById(categoryId)
    .populate({
      path: "courses",
      match: { status: "published" },
      populate: [
        { path: "ratingAndReview" },
        { path: "instructor" }
        // Add more fields to populate if needed
      ],
    })
    .exec();
    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected gategory.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      });
    }

    const categoryExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });
    let differentCategory = await Category.findOne(
      categoryExceptSelected[getRandomInt(categoryExceptSelected.length)]._id
    )
      .populate({
        path: "courses",
        match: { status: "published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    console.log();

    const allCategorys = await Category.find()
      .populate({
        path: "courses",
        match: { status: "published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    const allCourses = allCategorys.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    // return response
    return res.status(200).json({
      success: true,
      message: "All category",
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
