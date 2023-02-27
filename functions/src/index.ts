import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

admin.initializeApp(functions.config().firebase);
const database = admin.database();

export const readFromDatabase = functions.https.onRequest(async (req, res) => {
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

export const monitorTransaction =
  functions.https.onRequest((request, response) => {
    const ref = database.ref("daos");
    ref
        .once("value")
        .then((snapshot) => {
          const keys = Object.keys(snapshot.val());
          // ['lemon', 'orange', 'apple']
          keys.forEach((name) => {
            getAllEmailFromContractAddress(name);
          });
          console.log(keys);
        })
        .catch((error) => {
          console.error(error);
        });

    console.log("hello");
  // TODO : Fetch all contracts from DB
  // TODO : Fetch all emitted events since last time this functions is executed
  // TODO : Get all email addresses of that contract address
  // TODO : Classify the event type and send email to them
  }
  );

export const getAllEmailFromContractAddress = (name: string) => {
  const ref = database.ref("daos/" + name);
  const results: any[] = [];
  const data = {
    name,
    link: "https://aragon.org/",
  };
  ref
      .once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const email = childSnapshot.child("email").val();
          sendEmail(data, email);
          results.push(email);
        });
        console.log(results);
      })
      .catch((error) => {
        console.error(error);
      });
};

const sendEmail = async (data: any, email: string) => {
  // TODO : Classify event type and setchange data type
  const msg = {
    to: email,
    from: "0xyuzu.eth@gmail.com",
    templateId: "d-f24c1e30aaa44203afce57f084c37e53",
    dynamic_template_data: {
      name: data.name,
      url: data.url,
    },
  };


  sgMail.setApiKey(
      "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"
  );
  await sgMail.send(msg);
};
