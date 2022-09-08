import app from './app.js'

const port = process.env.PORT
const NODE_ENV = process.env.NODE_ENV

app.listen(port, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${port}`)
})