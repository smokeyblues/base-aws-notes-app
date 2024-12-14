import { notesTable, usersTable, secret } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  transform: {
    route: {
      handler: {
        link: [notesTable, usersTable, secret],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

// ROUTES to users
api.route("POST /users", "packages/functions/src/users/create.main");
api.route("GET /users/me", "packages/functions/src/users/get.main");
api.route("PUT /users/me", "packages/functions/src/users/update.main");
api.route("DELETE /users/me", "packages/functions/src/users/delete.main");

// ROUTES to notes
api.route("POST /notes", "packages/functions/src/notes/create.main");
api.route("GET /notes/{id}", "packages/functions/src/notes/get.main");
api.route("GET /notes", "packages/functions/src/notes/list.main");
api.route("PUT /notes/{id}", "packages/functions/src/notes/update.main");
api.route("DELETE /notes/{id}", "packages/functions/src/notes/delete.main");
api.route("POST /billing", "packages/functions/src/billing.main");