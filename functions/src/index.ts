import {
  testtesttask,
  scheduledNotifyProposalCreated,
} from "./handlers/scheduledNotifyProposalCreated";
import {scheduledNotifyProposalExecuted}
  from "./handlers/scheduledNotifyProposalExecuted";
import {
  scheduledNotifyMemberAdded,
} from "./handlers/scheduledNotifyMemberAdded";
// import {getDao} from "./utils";
import * as functions from "firebase-functions";

export {
  scheduledNotifyProposalCreated,
  scheduledNotifyProposalExecuted,
  scheduledNotifyMemberAdded,
};

exports.scheduledFunction = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await testtesttask();
    console.log(result);
  });
