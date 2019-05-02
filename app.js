const express = require("express");
const {connect, connection, Types} = require('mongoose');
const Message = require('./models/Message');

const app = express();
const port = process.env.PORT || 3000;
const mongoConnectionString = "mong" + "odb+" + "srv://" + "slamer" + "z:Nh1IJ" + "FQy5dPxgKj" + "Z@kenzi" + "e-kk9zx.mong" + "odb.net/test?r" + "etryWrites=true";

connect(mongoConnectionString, {useNewUrlParser: true});
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => { console.log('MongoDB connected')});

// Track last active times for each sender
let users = {};

app.use(express.static(__dirname+"/public"));
app.use(express.json());



// generic comparison function for case-insensitive alphabetic sorting on the name field
function userSortFn(a, b) {
  let nameA = a.name.toUpperCase(); // ignore upper and lowercase
  let nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
}

app.get("/messages", async (request, response) => {
  // get the current time
  const now = Date.now();

  // consider users active if they have connected (GET or POST) in last 15 seconds
  const requireActiveSince = now - 15 * 1000;

  // create a new list of users with a flag indicating whether they have been active recently
  let usersSimple = Object.keys(users).map(x => ({
    name: x,
    active: users[x] > requireActiveSince
  }));

  // sort the list of users alphabetically by name
  usersSimple.sort(userSortFn);
  usersSimple.filter(a => a.name !== request.query.for);

  // update the requesting user's last access time
  users[request.query.for] = now;

  // send the latest 40 messages and the full user list, annotated with active flags
  const messages = await Message
      .find()
      .sort({'date': -1})
      .limit(40);
  response.send({ messages: messages, users: usersSimple });
});

app.post("/messages", async (request, response) => {
  let message = new Message({_id: new Types.ObjectId, author: request.body.author, body: request.body.body, date: request.body.date});

  // append the new message to the message list
  await message.save((err, res) =>{
    if(err)
      console.error(err);
  });

  // update the posting user's last access timestamp (so we know they are active)
  users[request.body.author] = request.body.date;

  // Send back the successful response.
  response.status(201);
  response.send(request.body);
});

app.listen(port, () => console.log(`Express listening on port ${port}`));
