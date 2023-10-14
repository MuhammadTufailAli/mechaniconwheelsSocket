const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 8900;

const io = require("socket.io")(port, {
  cors: {
    origin: "*", //It is address of our react application || "http://localhost:3001"
  },
});

let users = [];
let mechanic = [];

//To add user to live users list
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });

  console.log(users);
};

const addMechanic = (userId, latitude, longitude, socketId) => {
  !mechanic.some((user) => user.userId === userId) &&
    mechanic.push({ userId, latitude, longitude, socketId });

  console.log(mechanic);
};

//TO remove disconnected user
const removeUser = (socketId) => {
  console.log("Socket id is " + socketId);
  console.log("Before delete users are" + users);
  users = users.filter((user) => user.socketId !== socketId);
  console.log("After delete users are" + users);
};

// const getUserForMessage = (userId) => {
//   console.log(userId[0]);
//   return users.find((user) => user.userId === userId[0]);
// };
const getUser = (userId) => {
  console.log(userId);
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log(socket.connected);

  //After connection take userId and socketId from user
  //.on is used to receive request
  socket.on("addUser", (userId) => {
    if (userId) {
      addUser(userId, socket.id);
      //emit to send request
      io.emit("getUsers", users); //is sa pata chla ga kon kon online ha
      //hum client side pa user ka is tarha get karta ha k 'getUsers' humara liya key ha
      //hum client side pa is key ko use karta hova value yani users get kar lata ha
    }
  });

  //Adding and getting mechanic
  socket.on("addMechanic", ({ userId, latitude, longitude }) => {
    if (userId) {
      addMechanic(userId, latitude, longitude, socket.id);
      //emit to send request
      io.emit("getMechanic", mechanic); //is sa pata chla ga kon kon online ha
      //hum client side pa user ka is tarha get karta ha k 'getUsers' humara liya key ha
      //hum client side pa is key ko use karta hova value yani users get kar lata ha
    }
  });

  //Get message from user
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    if (receiverId) {
      const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
      //ab us user ki socketId sa hum usa sender ka message send kar da ga
      //hum senderId and text send kara ga
      console.log(user);

      io.to(user?.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  //Request send by customer and received by All Mechanics

  socket.on(
    "SendCustomerNotificationToAllMechanics",
    ({
      _id,
      price,
      latitude,
      longitude,
      Description,
      refOfCustomer,
      Location,
      AcceptedByUser,
    }) => {
      console.log("Id of notification is " + _id);

      // const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
      //ab us user ki socketId sa hum usa sender ka message send kar da ga
      //hum senderId and text send kara ga

      io.emit("getNotificationFromMechanic", {
        _id,
        price,
        latitude,
        longitude,
        Description,
        refOfCustomer,
        Location,
        AcceptedByUser,
      });
    }
  );

  //Customer notification to be deleted
  socket.on("deleteCustomerNotification", ({ id }) => {
    console.log("Id to be deleted is " + id);

    // const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
    //ab us user ki socketId sa hum usa sender ka message send kar da ga
    //hum senderId and text send kara ga

    io.emit("getIdToDeleteNotification", {
      id,
    });
  });

  //Customer notification to be deleted when one mechanic req is accepted
  socket.on("deleteCustomerNotification2", ({ id }) => {
    console.log("Mechanic id is " + id);

    // const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
    //ab us user ki socketId sa hum usa sender ka message send kar da ga
    //hum senderId and text send kara ga

    io.emit("getIdToDeleteNotification2", {
      id,
    });
  });
  //Send if customer accept or reject mechanic offer
  socket.on(
    "SendResponseTomechanicOffer",
    ({ response, receiverId, senderId }) => {
      console.log("Customer has ", response, " mechanic offer");
      console.log(receiverId);
      if (receiverId) {
        const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
        //ab us user ki socketId sa hum usa sender ka message send kar da ga
        //hum senderId and text send kara ga

        console.log("The User is " + user);

        io.to(user?.socketId).emit("getResponseFromCustomerTomechanicOffer", {
          response,

          senderId,
        });
      }
    }
  );

  //Send notification from mechanic to customer
  socket.on(
    "sendToCustomer",
    ({ senderId, receiverId, latitude, longitude, price }) => {
      console.log("sendToCustomer IS CALLEDDDDDDDD");
      if (receiverId) {
        const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
        //ab us user ki socketId sa hum usa sender ka message send kar da ga
        //hum senderId and text send kara ga

        console.log("The User is " + user);

        io.to(user?.socketId).emit("getNotification", {
          senderId,
          latitude,
          longitude,
          price,
        });
      }
    }
  );

  //Sending Live location of mechanic to customer
  socket.on(
    "sendMechanicLiveLocation",
    ({ senderId, receiverId, mechanicLocation }) => {
      console.log("Live location of mechanic is sending to customer");
      if (receiverId) {
        const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
        //ab us user ki socketId sa hum usa sender ka message send kar da ga
        //hum senderId and text send kara ga

        console.log("The User is " + user);

        io.to(user?.socketId).emit("getMechanicLiveLocation", {
          senderId,
          mechanicLocation,
        });
      }
    }
  );

  //Tell customer that mechanic reached
  socket.on("sendIamReached", ({ senderId, receiverId }) => {
    console.log("I am reached customer");
    if (receiverId) {
      const user = getUser(receiverId); //Is sa huma pata chl gaya kis banda ko message send karna ha
      //ab us user ki socketId sa hum usa sender ka message send kar da ga
      //hum senderId and text send kara ga

      console.log("The User is " + user);

      io.to(user?.socketId).emit("getIamReached", {
        senderId,
      });
    }
  });

  //Sending Updated price tomechanic
  socket.on("sendUpdatedPrice", ({ senderId, price }) => {
    console.log("I am reached customer");

    io.emit("getUpdatedPrice", {
      senderId,
      price,
    });
  });

  //Logout
  socket.on("Logout", (userId) => {
    console.log("Logout is called");

    if (userId) {
      console.log("A user is disconnected using Logout");
      removeUser(socket.id);

      io.emit("getUsers", users);
    }
  });

  //If a user is discoonect or logout then we will remove this user from online users
  socket.on("disconnect", () => {
    console.log("A user is disconnected");
    removeUser(socket.id);

    io.emit("getUsers", users); //User remove karna k bad phr online user send kar da ga
  });
});
