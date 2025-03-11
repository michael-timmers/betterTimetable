"use server";

import React from 'react';
import planData from './planData'; // Ensure planData is a function returning a promise
import ClientComponent from './details'; // Adjust import path accordingly
import { validateSession } from "../../auth/sessionManager";

export default async function ServerComponent() {
    const { user } = await validateSession();

    // Assuming planData is an async function that returns data
    const data = await planData();

    // Render the ClientComponent with the fetched data
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
            <br></br>
            <ClientComponent data={data} />
        </>
    );
}
