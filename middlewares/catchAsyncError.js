export const CatchAsyncError = (passedFunction) => (req, resp, next) => {
  Promise.resolve(passedFunction(req, resp, next)).catch(next);
};
