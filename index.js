const app = require('./app')
const { PORT } = process.env // destructuring

app.listen(PORT, () => console.log(`Server is running at PORT: ${ PORT }`))