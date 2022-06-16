const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// <------ Validation Middleware ------>

// Check that dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
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
    message: "Dish must include a name."
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
    message: "Dish must include a description."
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
    message:
      "Dish must include a price. Dish must have a price that is an integer greater than 0."
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
    message: "Dish must include a image_url."
  });
}

// Check that id is found in db
function dishIdMatch(req, res, next) {
  const { dishId } = req.params;
  let { data: { id } } = req.body;

  // If dish.id is missing, empty, null, or undefined, set dish.id to params id
  if (!id) {
    id = dishId;
  }

  if (dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
  });
}

// <------ Route Handlers ------>
// create, read, update, and list

// Create a new dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const id = nextId();

  const newDish = {
    id,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);

  res.status(201).json({ data: newDish });
}

// Retrieve dish by id
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// Update dish by id
function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Update dish
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

// List all dishes
function list(req, res) {
  res.json({ data: dishes });
}

// Export Route Handlers
module.exports = {
  list,
  dishExists,
  create: [
    dishNameValidation,
    dishDescriptionValidation,
    dishPriceValidation,
    dishImageUrlValidation,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    dishIdMatch,
    dishNameValidation,
    dishDescriptionValidation,
    dishPriceValidation,
    dishImageUrlValidation,
    update,
  ],
};
