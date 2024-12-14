import { Resource } from "sst";
import { Util } from "@base-aws-notes-app/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const data = JSON.parse(event.body || "{}");

  const params = {
    TableName: Resource.Users.name,
    Key: {
      // The attributes of the item to be created
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId, // The id of the user
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET username = :username, email = :email, description = :description, profileimg = :profileimg, notes = :notes, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":username": data.username || null,
      ":email": data.email || null,
      ":description": data.description || null,
      ":profileimg": data.profileimg || null,
      ":notes": data.notes || null,
      ":updatedAt": Date.now(), // Using Unix timestamp
    },
  };

  await dynamoDb.send(new UpdateCommand(params));

  return JSON.stringify({ status: true });
});