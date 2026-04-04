const mongoose = require("mongoose");

const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err; // re-throw so the controller's error handler catches it
  } finally {
    session.endSession();
  }
};

module.exports = withTransaction;
