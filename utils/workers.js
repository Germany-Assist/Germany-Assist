import db from "../database/dbIndex.js";

async function notificationProcessor(job) {
  const data = job.data;
  try {
    switch (job.name) {
      case "payment_success":
        const notificationData = {
          message: "payment success",
          url: "",
          type: "info",
          user_id: data.user_id,
          service_provider_id: data.service_provider_id,
        };
        await db.Notification.create(notificationData);
        // Optional: send emails
        // await sendEmailNotifications(recipients, "Payment success");

        // Optional: send sockets
        // notifySockets(recipients, { message: "Payment success" });
        break;
      case "payment_failed":
        // handle failed payment
        break;

      case "comment_created":
        // handle comment notifications
        break;

      default:
        return;
    }
  } catch (error) {
    errorLogger(error);
    throw error;
  }
}
/*
what can notification be for 
1. payments: 
    1.success (buyer and seller - sockets , email) which also includes orders
    2.fail (buyer - sockets , email)
2. posts:
    1.creation (the clients who bought the timeline // - sockets)
3. comments:
    1. comment (the buyer - sockets)
    2. reply (the parent - sockets)

    //this is for later
4. user creation:
    this is a bit different since the email will be sent to activate the account
    also other admins might need to send an event notification to all the users

what do i need to do with the job 
    1. store the notification in the database this can be multi
        (user_id:the target,message:the body of the message,url: in case of redirecting,type:(info,warning,alert,system)) 
    2. send an email if needed
    3. send sockets if needed
    */
//   console.log(job);

const workersProcessors = { notificationProcessor };
export default workersProcessors;
