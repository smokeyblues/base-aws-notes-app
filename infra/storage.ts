// Create a secret for Stripe
export const secret = new sst.Secret("StripeSecretKey");
// export const publicKey = new sst.Secret("StripePublicKey");

// Create an S3 bucket
export const bucket = new sst.aws.Bucket("Uploads");

// Create the DynamoDB table
export const notesTable = new sst.aws.Dynamo("Notes", {
    fields: {
      userId: "string",
      noteId: "string",
    },
    primaryIndex: { hashKey: "userId", rangeKey: "noteId" },
  });