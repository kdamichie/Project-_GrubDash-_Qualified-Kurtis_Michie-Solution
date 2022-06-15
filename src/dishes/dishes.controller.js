const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// <------ Validation Middleware ------>

// Check that dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exists: ${dishId}.`
  });
}

// Check that name is provided and not empty
function dishNameValidation(req, res, next) {
  const { data: { name } = {} } = req.body;

  if (name) {
    return next();
  }
  next({
    status: 400,
    message: "No 'name' property provided",
  });
}

// Check that description is provided and not empty
function dishDescriptionValidation(req, res, next) {
  const { data: { description } = {} } = req.body;

  if (description) {
    return next();
  }
  next({
    status: 400,
    message: "No 'description' property provided",
  });
}

// Check that price is provided, is an integer, and is greater than 0
function dishPriceValidation(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (price && Number.isInteger(price) && price > 0) {
    return next();
  }
  next({
    status: 400,
    message: "'price' property is invalid or missing. 'price' must be integers and greater than 0",
  });
}

// Check that image url is provided and is not empty
function dishImageUrlValidation(req, res, next) {
  const { data: { image_url } = {} } = req.body;

  if (image_url) {
    return next();
  }
  next({
    status: 400,
    message: "No 'image_url' property provided",
  });
}

// <------ Route Handlers ------>
// create, read, update, and list

// Create a new dish
function create(req, res) {

}

// Retrieve dish by id
function read(req, res) {

}

// Update dish by id
function update(req, res) {

}

// List all dishes
function list(req, res) {
  res.json({ data: dishes });
}

 // Export Route Handlers
 module.exports = {
  list,
  dishExists,
  create: [isDishProvided, create],
  read: [dishExists, read],
  update: [dishExists, isDishProvided, update],
 }
