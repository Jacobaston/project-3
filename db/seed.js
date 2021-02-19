import mongoose from 'mongoose'
import connectToDb from '../lib/connectToDb.js'

// * Models
import User from '../models/user.js'
import MeetUp from '../models/meetUps.js'
// import Restaurant from '../models/restaurants.js'
import Poi from '../models/poi.js'


// * Data Files
import getUserData from './data/userData.js'
import getMeetUpData from './data/meetUpData.js'
// import getRestaurantData from './data/restaurantsData.js'
import getPoiData from './data/poiData.js'


async function seedDatabase() {
  try {
    await connectToDb()

    console.log('✅ Database connected!')

    await mongoose.connection.db.dropDatabase()

    console.log('😵 Database was dropped!')

    //* User data

    const users = await User.create(getUserData())

    console.log(`🙋‍♀️ ${users.length} users created!`)

    // * Meet-up Data

    const meetUps = await MeetUp.create(getMeetUpData())

    console.log(`🤝 ${meetUps.length} meet-ups created!`)

    // * Restaurant Data

    // const restaurants = await Restaurant.create(getRestaurantData())

    // console.log(`🍽 ${restaurants.length} restaurants created!`)

    // * POI Data

    const poi = await Poi.create(getPoiData(users))

    console.log(`🏰 ${poi.length} points of interest created!`)

    await mongoose.connection.close()
    console.log('👋 Goodbye!')

  } catch (err) {
    console.log('🙈 Something went wrong with seeding!')
    console.log(err)

    await mongoose.connection.close()
    console.log('👋 Goodbye!')
  }

}

seedDatabase()