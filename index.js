// creating server
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const uniqid = require("uniqid");

app.use(express.json()); // To access body of JSON

//Home Page
app.get("/", (req, res) => {
  res.status(200).json({ message: "Home Page" });
});

const rooms = [];
const bookings = [];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

//Get all rooms
app.get("/allrooms", (req, res) => {
  res.json({ Rooms: rooms });
});

//Create room
let roomNo = 100;
app.post("/createroom", (req, res) => {
  let room = {};
  room.id = uniqid();
  room.roomNo = roomNo;
  room.bookings = [];
  if (req.body.noSeats) {
    room.noSeats = req.body.noSeats;
  } else {
    req
      .status(400)
      .json({ message: "Please specify number of seats in a room" });
  }

  if (req.body.amenities) {
    room.amenities = req.body.amenities;
  } else {
    req.status(400).json({ message: "Please specify amenities in the room" });
  }

  if (req.body.price) {
    room.price = req.body.price;
  } else {
    req
      .status(400)
      .json({ message: "Please specify price of the room per hour" });
  }
  roomNo++;
  rooms.push(room);
  res.status(200).json({ message: "Room has been created" });
});

// Get all Bookings
app.get("/allbookings", (req, res) => {
  res.status(200).json({ AllBookings: bookings });
});

// Book room
app.post("/createbooking", (req, res) => {
  let booking = {};
  booking.id = uniqid();

  if (req.body.customerName) {
    booking.customerName = req.body.customerName;
  } else {
    res.status(400).json({ message: "Please provide CustomerName" });
  }

  if (req.body.date) {
    if (date_regex.test(req.body.date)) {
      booking.date = req.body.date;
    } else {
      res
        .status(400)
        .json({ message: "Please provide date in MM/DD/YYYY format" });
    }
  } else {
    res.status(400).json({ message: "Please provide date for Booking" });
  }

  if (req.body.startTime) {
    if (time_regex.test(req.body.startTime)) {
      booking.startTime = req.body.startTime;
    } else {
      res.status(400).json({ message: "Please provide time in HH:MM format" });
    }
  } else {
    res.status(400).json({ message: "Please provide starttime for Booking" });
  }

  if (req.body.endTime) {
    if (time_regex.test(req.body.endTime)) {
      booking.endTime = req.body.endTime;
    } else {
      res.status(400).json({ message: "Please provide time in HH:MM format" });
    }
  } else {
    res.status(400).json({ message: "Please provide endtime for Booking" });
  }

  //Check for Room availability
  const availableRooms = rooms.filter((room) => {
    if (room.bookings.length == 0) {
      return true;
    } else {
      room.bookings.filter((book) => {
        if (book.date == req.body.date) {
          if (
            parseInt(book.startTime.substring(0, 1)) >
              parseInt(req.body.startTime.substring(0, 1)) &&
            parseInt(book.startTime.substring(0, 1)) >
              parseInt(req.body.endTime.substring(0, 1))
          ) {
            if (
              parseInt(book.startTime.substring(0, 1)) <
                parseInt(req.body.startTime.substring(0, 1)) &&
              parseInt(book.startTime.substring(0, 1)) <
                parseInt(req.body.endTime.substring(0, 1))
            ) {
              return true;
            }
          }
        } else {
          return true;
        }
      });
    }
  });

  if (availableRooms.length == 0) {
    res
      .status(400)
      .json({ output: "No available Rooms on selected date and time. Please select other date or timings" });
  } else {
    roomRec = availableRooms[0];
    let count = 0;
    rooms.forEach((element) => {
      if (element.roomNo == roomRec.roomNo) {
        rooms[count].bookings.push({
          custName: req.body.custName,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          date: req.body.date,
        });
      }
      count++;
    });
    let bookingRec = req.body;
    bookingRec.roomNo = roomRec.roomNo;

    bookings.push(bookingRec);
    res.status(200).json({ output: "Room Booked Successfully" });
  }
});

app.listen(port, () => {
  console.log("Server listening to Port " + port);
});
