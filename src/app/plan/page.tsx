import React from 'react';
import planData from './planData'; // Ensure planData is a function returning a promise
import Details from './details'; // Adjust import path accordingly
import { validateSession } from "../../auth/sessionManager";

export default async function ServerComponent() {
  const { user } = await validateSession();

  return (
    <>
      <p>
        The following user has logged in:{" "}
        {user ? (
          <>
            {user.firstName} {user.lastName}
          </>
        ) : (
          "Guest"
        )}
      </p>
      <br />
      <Details />
    </>
  );
}
