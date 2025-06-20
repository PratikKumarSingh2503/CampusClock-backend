const generateCode = () => {
  let code = '';
  const length = 6 + Math.floor(Math.random() * 2); // 6 or 7 digits
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

module.exports = generateCode;
