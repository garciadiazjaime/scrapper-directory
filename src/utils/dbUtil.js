import mongoose from 'mongoose'

export const openDatabase = dbUrl => mongoose.connect(dbUrl)

export const closeDatabase = () => mongoose.disconnect()
