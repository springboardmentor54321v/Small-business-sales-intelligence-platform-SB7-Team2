exports.getUsers = (req, res) => {
  res.status(200).json({ message: 'User list endpoint placeholder' });
};

exports.getUserById = (req, res) => {
  res.status(200).json({ message: `User ${req.params.id} endpoint placeholder` });
};
