import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.user._id = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const farmerOnly = (req, res, next) => {
  if (req.user.role !== 'farmer')
    return res.status(403).json({ message: 'Farmer access only' });
  next();
};

export const customerOnly = (req, res, next) => {
  console.log('customerOnly check — role:', req.user.role); // ← check Node terminal
  if (req.user.role !== 'customer')
    return res.status(403).json({ message: 'Customer access only' });
  next();
};