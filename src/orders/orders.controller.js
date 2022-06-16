const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// <------ Validation Middleware ------>

// Check that order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exists: ${orderId}.`,
  });
}

// Check that deliveryTo is provided and not empty
function orderDeliveryToValidation(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;

  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

// Check that mobileNumber is provided and not missing
function orderMobileNumberToValidation(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;

  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

// Check that dishes is provided and is an array with at least one dish
function orderDishValidation(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

// Check that quantity is provided, is an integer, and is greater than 0
function orderQuantityValidation(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      !Number.isInteger(dish.quantity) ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  });

  next();
}

// Check that id is found in db
function orderIdMatch(req, res, next) {
  const { orderId } = req.params;
  let { data: { id } } = req.body;

  // If order.id is missing, empty, null, or undefined, set order.id to params id
  if (!id) {
    id = orderId;
  }

  if (orderId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
  });
}

// Check that status is provided and not empty and handle states of status
function orderStatusCheckVerification(req, res, next) {
  const { data: { status } } = {} = req.body;

  switch (status) {
    case "pending":
      break;
    case "preparing":
      break;
    case "out-for-delivery":
      break;
    case "delivered":
      break;
    default:
      next({
        status: 400,
        message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
  }
  next();
}

// <------ Route Handlers ------>
// create, read, update, list, and delete

// Create a new order
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const id = nextId();

  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
}

// Retrieve order by id
function read(req, res) {
  res.json({ data: res.locals.order });
}

// Update order by id
function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  // Update dish
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

// List all orders
function list(req, res) {
  res.json({ data: orders });
}

// Delete order
function destroy(req, res, next) {
  const { orderId } = req.params;
  const order = res.locals.order;

  if (order.status === "pending") {
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);

    res.sendStatus(204);
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending"
  });
}

module.exports = {
  list,
  orderExists,
  create: [
    orderDeliveryToValidation,
    orderMobileNumberToValidation,
    orderDishValidation,
    orderQuantityValidation,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    orderIdMatch,
    orderDeliveryToValidation,
    orderMobileNumberToValidation,
    orderDishValidation,
    orderQuantityValidation,
    orderStatusCheckVerification,
    update,
  ],
  delete: [
    orderExists,
    destroy
  ],
};
