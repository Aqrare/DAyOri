import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

admin.initializeApp(functions.config().firebase);

export const readFromDatabase = functions.https.onRequest(async (req, res) => {
  const database = admin.database();
  const ref = database.ref("users");
  const snapshot = await ref.once("value");
  const data = snapshot.val();
  res.send(data);
});

// Send resistration email
// onCreate, new email
// send email to the email address

// Monitor new DAO contracts
// Monitor Aragon Factory Contract adn if it emitted deployed
// event, add that contract address to our DB

export const monitorTransaction = () => {
  console.log("hello");
  // TODO : Fetch all contracts from DB
  // TODO : Fetch all emitted events since last time this functions is executed
  // TODO : Get all email addresses of that contract address
  // TODO : Classify the event type and send email to them
};
