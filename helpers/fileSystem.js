exports.getFileExtension = (filePath) => {
  return (/[^.]+$/.exec(filePath)[0]);
};