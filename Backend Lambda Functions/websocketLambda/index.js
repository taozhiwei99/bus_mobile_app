//import libaries
const AWS = require('aws-sdk');
const ENDPOINT = 'nuhyx0cvg8.execute-api.ap-southeast-1.amazonaws.com/prod/';
const client = new AWS.ApiGatewayManagementApi({ endpoint: ENDPOINT });
//store the usernames
const usernames = {};
const usersLocation = {};

//send private msg
const sendPrivateMsg = async (id, body) => {
  try {
    await client.postToConnection({
      ConnectionId: id,
      Data: JSON.stringify(body),
    }).promise();
  } catch (err) {
    console.error("Error sending private message", err);
  }
};

//send public msg
const sendPublicMsg = async (ids, body) => {
  const all = ids.map(i => sendPrivateMsg(i, body));
  return Promise.all(all);
};


//handling the routes
exports.handler = async (event) => {
  if (event.requestContext) {
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    let body = {};

    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (err) {
      console.error("Internal server error", err);
    }

    switch (routeKey) {
      case '$connect':
        break;
      case '$disconnect':
        //function to handle disconnect
        await sendPublicMsg(Object.keys(usernames), {systemMessage: `${usernames[connectionId]} has left the chat`})
        delete usernames[connectionId];
        await sendPublicMsg(Object.keys(usernames), {members: Object.values(usernames) });
        break;
      case '$default':
        break;
      case 'setName':
        //function to set the name of current connection
        usernames[connectionId] = body.name;
        await sendPublicMsg(Object.keys(usernames), {members: Object.values(usernames)});
        await sendPublicMsg(Object.keys(usernames), {systemMessage: `${usernames[connectionId]} has joined the chat`});
        break;
      case 'setUsers':
        usersLocation[connectionId] = body.username;
        await sendPublicMsg(Object.keys(usersLocation), {systemMessage: `${usersLocation[connectionId]} has joined the chat`});
        break;
      case 'sendPublic':
        //function to send public message
        await sendPublicMsg(Object.keys(usernames), {publicMessage: `${usernames[connectionId]}: ${body.message}`});
        break;
      case 'sendPrivate':
        //function to send private message
        const to = Object.keys(usernames).find(key => usernames[key] === body.to);
        await sendPrivateMsg(to, { privateMessage: `${usernames[connectionId]}: ${body.message}`});
        break;
      case 'sendLocation':
        await sendPublicMsg(Object.keys(usersLocation), {locationMessage: `${usersLocation[connectionId]}: ${body.location}`});
        break;
      default:
    }
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};