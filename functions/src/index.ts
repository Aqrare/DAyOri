import {
  testtesttask,
  scheduledNotifyProposalCreated,
} from "./handlers/scheduledNotifyProposalCreated";
// import {getDao} from "./utils";
import * as functions from "firebase-functions";

export {scheduledNotifyProposalCreated};

exports.scheduledFunction = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await testtesttask();
    console.log(result);
  });
