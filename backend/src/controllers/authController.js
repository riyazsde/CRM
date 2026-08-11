const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie
} = require("../utils/tokens");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash
    });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user: publicUser(user), accessToken });
  } catch (error) {
    next(error);
  }
}

async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await RefreshToken.deleteMany({ user: user._id });
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setRefreshCookie(res, refreshToken);

    res.json({ user: publicUser(user), accessToken });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Refresh token missing" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (payload.type !== "refresh") return res.status(401).json({ message: "Invalid refresh token" });

    const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
    if (!stored || stored.expiresAt < new Date()) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token expired or revoked" });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    await RefreshToken.deleteOne({ _id: stored._id });

    const nextRefresh = createRefreshToken(user);
    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(nextRefresh),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setRefreshCookie(res, nextRefresh);

    res.json({ user: publicUser(user), accessToken: createAccessToken(user) });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

async function signout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { signup, signin, refresh, signout, me };
