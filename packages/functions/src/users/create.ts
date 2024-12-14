import { Resource } from "sst";
import { Util } from "@base-aws-notes-app/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  let data = {
    username: "",
    email: "",
    description: "",
    profileimg: "",
    notes: 1,
  };

  if (event.body != null) {
    data = JSON.parse(event.body);
  }

  const params = {
    TableName: Resource.Users.name,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId, // The id of the user
      username: data.username, // parsed from the request body
      email: data.email, // parsed from request body
      description: data.description, // Parsed from request body
      profileimg: data.profileimg, // Parsed from request body
      notes: data.notes, // Parsed from the request body
      createdAt: Date.now(), // Current Unix timestamp
      updatedAt: Date.now(), // Using Unix timestamp
    },
  };

  await dynamoDb.send(new PutCommand(params));

  return JSON.stringify(params.Item);
});