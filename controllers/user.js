import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import { secret } from '../config/environment.js'

async function register(req, res, next) {
  const body = req.body

  try {
    const user = await User.create(body)
    res.status(201).send(user)
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  const password = req.body.password

  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user || !user.validatePassword(password)) {
      return res.status(401).send({ message: 'Your password is incorrect, please try again' })
    }

    const token = jwt.sign(
      { userId: user._id },
      secret,
      { expiresIn: '24h' }
    )

    res.status(202).send({ token, message: 'Login successful!' })
  } catch (err) {
    console.log('error here')
    next(err)
  }
}

async function getUser(_req, res, next) {
  try {
    const userList = await User.find()
    res.status(200).send(userList)
  } catch (err) {
    next(err)
  }
}

async function removeUser(req, res, next) {
  const id = req.params.id
  const currentUser = req.currentUser

  try {
    const userToRemove = await User.findById(id)

    if (!currentUser._id.equals(userToRemove._id)) {
      return res.status(401).send({ message: 'Unauthorized, you can only delete your own account' })
    }

    await userToRemove.deleteOne()

    res.send(userToRemove)

  } catch (err) {
    next(err)
  }
}

async function updateUser(req, res, next) {
  const id = req.params.id
  const body = req.body
  const currentUser = req.currentUser

  try {
    const userToUpdate = await User.findById(id)

    if (!currentUser._id.equals(userToUpdate._id)) {
      return res.status(401).send({ message: 'Unauthorized, this is not you profile' })
    }
    userToUpdate.set(body)

    await userToUpdate.save()

    res.send(userToUpdate)

  } catch (err) {
    next(err)
  }
}

async function getSingleUser(req, res, next) {
  const id = req.params.id

  try {
    const singleUser = await User.findById(id).populate('poiWishlist').populate('restaurantWishlist').populate('restaurantWishlist.creator').populate('eventsAttended').populate('eventsCreated').populate('upcomingEvents').populate('userReviews.user')
    res.status(200).send(singleUser)
  } catch (err) {
    next(err)
  }
}

async function getUserInbox(req, res, next) {
  const id = req.params.id

  try {
    const userInbox = await User.findById(id)
    res.status(200).send(userInbox.inbox)
  } catch (err) {
    next(err)
  }
}

//Comments

async function makeComment(req, res, next) {
  const commentData = req.body
  const userId = req.params.userId
  commentData.user = req.currentUser

  try {
    const user = await User.findById(userId).populate('userReviews.user').populate('user')
    console.log(user)

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    user.userReviews.push(commentData)

    const savedUser = await user.save()

    res.send(savedUser)

  } catch (err) {
    next(err)
  }
}

async function updateComment(req, res, next) {
  const commentData = req.body
  const currentUser = req.currentUser
  const { commentId, userId } = req.params

  try {
    const user = await User.findById(userId).populate('user').populate('userReviews.user')

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    const comment = user.userReviews.id(commentId)

    if (!comment.user.equals(currentUser._id)) {
      return res.status(401).send({ message: 'Unauthorized, this is not your comment to change' })
    }

    comment.set(commentData)

    const savedUser = await user.save()

    res.send(savedUser)

  } catch (err) {
    next(err)
  }
}

async function deleteComment(req, res, next) {
  const commentData = req.body
  const currentUser = req.currentUser
  const { commentId, userId } = req.params

  try {
    const user = await User.findById(userId).populate('user').populate('userReviews.user')

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    const comment = user.userReviews.id(commentId)

    if (!comment.user.equals(currentUser._id)) {
      return res.status(401).send({ message: 'Unauthorized, this is not your comment to change' })
    }

    comment.remove(commentData)

    const removedUser = await user.save()

    res.send(removedUser)

  } catch (err) {
    next(err)
  }
}

export default {
  register,
  login,
  getUser,
  removeUser,
  updateUser,
  getUserInbox,
  getSingleUser,
  makeComment,
  updateComment,
  deleteComment
}